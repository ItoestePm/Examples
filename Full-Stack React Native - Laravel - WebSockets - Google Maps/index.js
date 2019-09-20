import React from 'react';
import {Dimensions} from 'react-native';
import {Input, Icon} from 'react-native-elements';
import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  ActivityIndicator,
  AsyncStorage,
  Image,
  PixelRatio,
  Animated,
  ScrollView,
  Keyboard ,
  StatusBar,
  Platform,
  TouchableOpacity
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Font } from 'expo';
import Url from '../utils/Url.js'
import { Transition } from 'react-navigation-fluid-transitions';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Echo from 'laravel-echo/dist/echo';
import Socketio from 'socket.io-client';

const PUSH_ENDPOINT = Url.Prod + 'exponent/devices/subscribe';

async function updateState(destinyAddress, coords){

  await this.setState({
    destinyAddress: destinyAddress, 
    searchView:true,
    latituded:coords.lat,
    longituded:coords.lng,})

}

class MapInput extends React.Component {

   async updateChild(destinyAddress, coords) {
      await updateState(destinyAddress, coords)
  }
    
  render(){
      return(

        <GooglePlacesAutocomplete
        styles={{
          listView:{
            backgroundColor:'#333333',
            color: 'white',
            borderColor:'#f5c11d'
          },
          description:{
            color:'white',
            borderColor:'#f5c11d'

          },
          container:{
            backgroundColor:'#333333',

          },
          textInputContainer:{
            backgroundColor: '#f5c11d',
            height: 44,
            color:'white',
            borderTopColor: '#7e7e7e',
            borderBottomColor: '#b5b5b5',
            borderTopWidth: 1 / PixelRatio.get(),
            borderBottomWidth: 1 / PixelRatio.get(),
            flexDirection: 'row',
          },
          textInput:{
            backgroundColor: '#333333',
            height: 28,
            color:'white',
            borderRadius: 5,
            paddingTop: 4.5,
            paddingBottom: 4.5,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: 7.5,
            marginLeft: 8,
            marginRight: 8,
            fontSize: 15,
            flex: 1
          }
        }}
        minLength={2}
        placeholder={'Busca una dirección'}
        autoFocus={true}
        returnKeyType={'search'} 
        listViewDisplayed={true}
        fetchDetails={true}
        onPress={(data, details=null)=>{
          this.updateChild(data.description, details.geometry.location)
        }}
        query={{
            key: 'AIzaSyDuD-3eGh7vNWJyU04aT7h9wJqZb38QBqc',
            language: 'es',
            components:'country:ar',
        }}
        />

      )
  }
}

class Index extends React.Component {
  static navigationOptions = {
    title: 'Welcome'
  };
 
  constructor(props) {
    super(props);
    this.state = {
      latitude: null,
      longitude: null,
      latituded:null,
      longituded:null,
      searchView: true,
      total: 0,
      userLat: -34.573946,
      userLng: -58.536146,
      loadCard: false,
      distance: 0,
      showMenu:false,
      opacity: new Animated.Value(0),
      startAddress: '',
      destinyAddress: '',
      coordLoaded: false,
      price_base: 0,
      price_km: 0,
      total: 0,
      error: null,
      fontsLoaded: false,
      travelWait: false
    };

    updateState = updateState.bind(this)

  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if(this.state.searchView === false)
      {
        this.setState({
          searchView:true
        })
        return true;
      }
      return true;

    });

    await this.requestWS()

    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      await navigator.geolocation.watchPosition(
        (position) => {
          
          this.setState({
            userLat: position.coords.latitude,
            userLng: position.coords.longitude,
            coordLoaded: true,
            error: null,
          }, ()=>{
            this.watchID = navigator.geolocation.watchPosition(
              position => {
                const { coordinate, routeCoordinates, distanceTravelled } = this.state;
                
                const userLat = this.state.userLat;
                const userLng = this.state.userLng;

                const newCoordinate = {
                  userLat,
                  userLng
                };
                if (Platform.OS === "android") {
                  if (this.marker) {
                    this.marker._component.animateMarkerToCoordinate(
                      newCoordinate,
                      500
                    );
                   }
                 } 
               },
               error => console.log(error),
               { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
            this.getDirectionApi()
          });
        },
        (error) => this.setState({ error: error.message }),
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 0, distanceFilter: 1},
      );
    }
    await Font.loadAsync({font1: require("../assets/fonts/Roboto-Regular.ttf"), font2: require("../assets/fonts/Roboto-Bold.ttf")});
    this.setState({fontsLoaded: true});
  }

  async requestWS() {
    const value = await AsyncStorage.getItem('readygo_token');

    window.Echo = new Echo({
        broadcaster: 'socket.io',
        host: 'http://159.89.147.224:6001',  
        client: Socketio,
        auth: {
            'headers': {
                'Authorization': 'Bearer ' + value,
            },
        },
        key: "Bearer " + value,
        timeout: 10000,
        jsonp: false,
        transports: ["websocket"],
        autoConnect: true,
        agent: "-",
        pfx: "-",
        cert: "-",
        ca: "-",
        ciphers: "-",
        rejectUnauthorized: "-",
        perMessageDeflate: "-"
    });

    window.Echo.channel('laravel_database_channel-name')
    .listen('MessagePushed', (e) => {
    });
  }

  async getDirectionApi(){
    let coordsUser = {latitude: this.state.userLat, longitude: this.state.userLng}
    let address = await Location.reverseGeocodeAsync(coordsUser)
    let inputAddress = address[0].street +' '+ address[0].name
    this.setState({
      startAddress: inputAddress
    },()=>{
      this.setState({
        loadCard:true
      })
    }) 
  }

  toTravel = async () => {
    const value = await AsyncStorage.getItem('readygo_token');
    let that = this;
    await fetch('' + Url.Dev + '/travelRequest', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + value,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin_address: this.state.startAddress,
        destiny_address: this.state.destinyAddress,
        distance: this.state.distance,
        origin_lat: this.state.userLat,
        origin_lng: this.state.userLng,
        destiny_lat: this.state.latituded,
        destiny_lng: this.state.longituded,
        price_base: this.state.price_base,
        price_km: this.state.price_km,
        total: this.state.total,
      })
    }).then((response) => response.json()).then((res) => {
      that.setState({
        travelWait: true
      })
    }).catch((error) => {
    });
  }

  registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();

    const value = await AsyncStorage.getItem('readygo_token');
    return fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + value,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expo_token: token,
        user: {
          username: 'Brent',
        },
      })
    }).then((response) => response.json()).then((res) => {
    });
  }

  getMapRegion = () => ({
    latitude: this.state.userLat,
    longitude: this.state.userLng,
    latitudeDelta:  0.0090,
    longitudeDelta: 0.0090 * (200 / 200)
  });

  render() {
    const {height, width} = Dimensions.get('window');
    const LATITUDE_DELTA = 0.0090;
    const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);
    if (this.state.fontsLoaded) {
      if (this.state.searchView == false) {
        return(
          <MapInput />
        )
      } else {
        return (
            
          <View style={styles.container}>

            <StatusBar barStyle="dark-content" 
              hidden={false} 
              backgroundColor="#e3b420" 
              translucent={false} 
              networkActivityIndicatorVisible={true}/>
  
            <MapView
              style={styles.backgroundImage}
              ref={c => this.mapView = c}
              showUserLocation
              followUserLocation
              loadingEnabled
              region={this.getMapRegion()}
              initialRegion={{
              latitude: this.state.userLat,
              longitude: this.state.userLng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }}>

                <MapView.Marker
                    coordinate={{
                        latitude: this.state.userLat,
                        longitude: this.state.userLng
                    }}
                    anchor={{x:0.5, y:0.5}}
                    >
                  <Image source={require('../assets/images/marker.png')} style={{ width: 40, height: 40, resizeMode:'stretch' }}  />
                </MapView.Marker>

              {this.state.longituded ?
                 <MapView.Marker
                 coordinate={{
                 latitude: this.state.latituded,
                 longitude: this.state.longituded
               }}
               anchor={{x:0.5, y:0.5}}
                 >
                   <Image source={require('../assets/images/destiny.png')} style={{ width: 90, height: 30, resizeMode:'stretch' }}  />
                   </MapView.Marker>
                : null} 

              {this.state.longituded ? 
              <MapViewDirections
              origin={{
                latitude: this.state.userLat,
                longitude: this.state.userLng
                }}
              destination={{
                latitude: this.state.latituded,
                longitude: this.state.longituded
                }}
              apikey='AIzaSyDuD-3eGh7vNWJyU04aT7h9wJqZb38QBqc'
              strokeWidth={6}
              strokeColor="#f5c11d"
              onReady={(result) => {
              this
                .mapView
                .fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: (width / 2),
                    bottom: (height / 2),
                    left: (width / 2),
                    top: (height / 2)
                  }
                });
                this.setState({
                  distance: result.distance
                })
                 fetch(Url.Prod + '/getPrices/'+ result.distance+'' , {
                  method: 'GET',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                }).then((response) => response.json()).then((res) => {

                  this.setState({
                    price_base: res.success.price_base,
                    total_km: res.success.total_km,
                    total: res.success.total
                  })
                });
            }}/>
            : null  
            }
            </MapView>
            <TouchableOpacity
            style={{
              position: 'absolute',
              top: hp('2%'),
              right: wp('4%'),
              alignSelf: 'flex-end'
            }}
            onPress={
              () =>{
                Animated.timing(this.state.opacity, {
                  toValue: 1,
                  duration: 125,
                  useNativeDriver: true,
                }).start();
                this.setState({
                  showMenu:true
                })
              }
            }>
            <Icon
              type='material'
              color='#000000'
              size={30}
              name='menu'/>

            </TouchableOpacity>
            <View style={styles.logo}>
              <Image style={styles.logoImage} source={require('../assets/images/logo1.png')}/>
            </View>
            <Transition appear='bottom' disappear='bottom'>

            {this.state.travelWait ? 
            <View style={styles.card}>
            <View >
              <ActivityIndicator size="large" color="#e3bb1c"/> 
              <Text style={{color:'white',
                            fontSize: hp('2%'),
                          }}>Esperando que un conductor acepte su solicitud...</Text>
            </View>
            </View> : 
            
            <View style={styles.card}>
                {this.state.loadCard ? 
                <View style={{
                    width: wp('85%'),
                }}>
                <Input
                    label={'Inicio'}
                    labelStyle={styles.label}
                    placeholder={'Mi ubicación actual'}
                    value={this.state.startAddress}
                    placeholderTextColor={'#ffffff'}
                    inputStyle={styles.input}
                    rightIcon={{
                    type: 'material',
                    name: 'my-location'
                    }}
                    rightIconContainerStyle={styles.icon}
                    inputContainerStyle={styles.inputCont}/>
                <Input
                    onFocus={()=>{
                    Keyboard.dismiss()
                    this.setState({
                        searchView:false,
                    })
                    }}
                    label={'Destino'}
                    labelStyle={styles.label}
                    placeholder={'¿Dónde querés ir?'}
                    placeholderTextColor={'#ffffff'}
                    inputStyle={styles.input}
                    value={this.state.destinyAddress}
                    rightIcon={{
                    type: 'material',
                    name: 'my-location'
                }}
                    rightIconContainerStyle={styles.icon}
                    inputContainerStyle={styles.inputCont}/>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonYellow} onPress={() =>{
                    this.toTravel()
                    }}>
                    <Image
                        style={{
                        width: '25%',
                        height: '100%',
                        resizeMode: 'stretch'
                    }}
                        source={require('../assets/images/vehiclebutton.png')}/>
                    <Text style={styles.buttonYellowText}>${this.state.total}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    title="Solid Button"
                    color="#dddddd"
                    style={styles.buttonWhite}
                    onPress={this.toMessenger}>
                    <Image
                        style={{
                        width: '25%',
                        height: '100%',
                        resizeMode: 'stretch'
                    }}
                        source={require('../assets/images/delivery.png')}/>
                    <Text style={styles.buttonYellowText}>$90</Text>
                    </TouchableOpacity>
                    </View> 
                </View>: 

                <ActivityIndicator size="large" color="#e3bb1c"/>
                }

                </View>
            }
            </Transition>

             {this.state.showMenu ? 
            <View animation="fadeInRight">
                <View style={{
                  flexDirection:'row',
                }}>
                  <TouchableOpacity onPress={
                    () =>{
                      this.setState({
                        showMenu:false
                      })
                    }
                  }>
                  <View style={{
                    backgroundColor: 'rgba(52, 52, 52, 0.5)',
                    height: hp('100%'),
                    width: wp('40%'),

                  }}>
                    </View>
                  </TouchableOpacity>
                  <View style={{
                    height: hp('100%'),
                    width: wp('60%'),
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 12,
                    },
                    shadowOpacity: 0.58,
                    shadowRadius: 16.00,

                    elevation: 24,
                    backgroundColor:'#000000'
                  }}>
                    <View style={{
                      width:wp('100%'),
                      height:hp('25%'),
                    }}>
                      <View style={{
                        flexDirection:'row'
                      }}>
                        <View style={{
                          justifyContent: 'center',
                          height:hp('25%'),
                          width:wp('30%')
                        }}>
                          <Image style={{
                            height:hp('12%'),
                            width:wp('20%'),
                            alignSelf:'center',
                            resizeMode:'stretch'
                          }} source={require('../assets/images/profilemenu.png')}/>
                        </View>
                        <View style={{
                          justifyContent: 'center',
                          height:hp('25%'),
                          width:wp('30%'),
                        }}>
                          <Text style={{
                            color:'white',
                            fontSize: hp('3%'),
                          }}>Esteban</Text>
                          <View style={{
                            flexDirection:'row',
                            alignContent:'center',
                            marginTop:hp('2%'),
                          }}>
                          <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/profileicon.png')}/>
                          <Text style={{
                            color:'white',
                            fontSize: hp('2%'),
                            marginLeft:wp('1%')

                          }}>Mi perfil</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <ScrollView style={{
                      width:wp('100%'),
                      height:hp('75%'),
                    }}>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/locationicon.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Mis Viajes</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/locationicon.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Mis Mensajes</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/30.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Medios de pago</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/31.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Billetera Virtual</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/32.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Chat ReadyGo</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/33.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Cerrar Sesión</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/01.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Referidos!</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <View style={{
                          flexDirection:'row',
                          marginTop:10,

                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2.3%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/35.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('2.5%')
                            }}>Usuario</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>{
                          this.toDocumentationDriver()
                        }}
                      >
                        <View style={{
                          flexDirection:'row',
                        }}>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('15%'),
                            alignContent:'center',
                            alignItems:'center',
                            justifyContent:'center',
                          }}>
                            <Image style={{
                            height:hp('2.3%'),
                            width:wp('4%'),
                            resizeMode:'stretch'
                          }} source={require('../assets/images/34.png')}/>
                          </View>
                          <View style={{
                            height:hp('7.5%'),
                            width:wp('50%'),
                            alignContent:'center',
                            justifyContent:'center',
                          }}>
                            <Text style={{
                              color:'white',
                              fontSize:hp('3.5%')
                            }}>Conductor</Text>
                          </View>    
                        </View>
                      </TouchableOpacity>
                    </ScrollView>
                </View>
                </View>
            </View>
              : null} 
          </View>
        );
      }
    } else {
      return (
        <View style={styles.bgStyle}>
          <ActivityIndicator size="large" color="#e3bb1c"/>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  bgStyle: {
    height: hp('100%'),
    width: wp('100%'),
    backgroundColor: '#333333'
  },
  backgroundImage: {
    position: 'absolute',
    width: wp('100%'),
    height: hp('100%')
  },
  card: {
    backgroundColor: 'rgba(52, 52, 52, 0.7)',
    position: 'absolute',
    width: wp('97%'),
    height: hp('40%'),
    bottom: 0,
    left: wp('1.7%'),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    padding: 25,
    paddingRight: wp('6.5%')
  },
  cardText: {
    color: '#ffffff'
  },
  logo: {
    position: 'absolute',
    top: 0,
    left: wp('40%'),
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  logoImage: {
    width: wp('20%'),
    height: hp('3.2%'),
    resizeMode: 'stretch'
  },
  icon: {
    marginLeft: wp('-15%')
  },
  input: {
    height: hp('3.2%'),
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: wp('3%'),
    marginRight: wp('5%'),
    padding: wp('2%'),
    paddingRight: wp('5%'),
    borderRadius: 15
  },
  inputCont: {
    borderWidth: 0,
    borderBottomWidth: 0
  },
  label: {
    marginLeft: wp('2%'),
    marginTop: hp('1%'),
    color: '#FFFFFF'
  },
  buttonContainer: {
    marginTop: hp('3.7'),
    marginBottom: hp('5%'),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonYellow: {
    backgroundColor: '#e3b420',
    width: wp('60%'),
    height: hp('6%'),
    alignItems: 'flex-start',
    padding: 10,
    paddingBottom: 10,
    borderRadius: 15,
    marginLeft: wp('5%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonYellowText: {
    fontSize: hp('4%'),
    fontFamily: 'font2',
    marginLeft: wp('4%')
  },
  buttonWhite: {
    fontFamily: 'font2',
    backgroundColor: '#ffffff',
    width: wp('30%'),
    height: hp('6%'),
    alignItems: 'flex-end',
    padding: 10,
    borderRadius: 15,
    marginLeft: wp('-4.8%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default Index;
