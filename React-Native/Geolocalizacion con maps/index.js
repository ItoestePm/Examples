import React, { Component, PropTypes } from 'react';

import Color from 'app/utils/Color'

import {connect} from 'react-redux'

import EstudioTextInput from 'app/containers/EstudioTextInput'
import EstudioButton1 from 'app/containers/EstudioButton1'
import EstudioText from 'app/containers/EstudioText'

import {
	StyleSheet,
	View,
	Dimensions,
} from 'react-native'

import { MapView } from 'expo';

import RNPickerSelect from 'react-native-picker-select';

const geoApiKey = "YOUR_API"

let win = Dimensions.get("window")

import _ from 'lodash'

import TopBarPrice from '../containers/TopBarPrice'

import { NavigationOrder } from 'app/components/Orders/components/Navigation'
import {
  changeLocality,
  changeAddressText,
  updateGeo
} from 'app/redux/actions/new-order/map'
import { getServicesSelector } from 'app/redux/selectors/new-order/services'
import {
  getDataSelector,
  getLocalitySelector,
  getAddressTextSelector,
  getLocationSelector,
  getInitialRegionSelector
} from 'app/redux/selectors/new-order/map'

class CreateOrderMap extends Component {
    constructor (props) {
        super(props);
        this.inputRefs = {};
    }

    validate (){
        const { addressText } = this.props
        this.getGeoLocationByAddress(addressText)
    }

    componentDidMount (){
    }

    getGeoLocation(geo){
    	console.log("getGeoLocation", geo)
    	fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + geo.latitude + ',' + geo.longitude + '&key=' + geoApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
        	this.updateStateWithGeo(responseJson, false)
    	})
    }

	getGeoLocationByAddress (address) {
		console.log("getGeoLocationByAddress", address)
		let {zones}  = this.props.orders
		fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + ` ${zones[this.props.locality].name} ` +  ' Argentina&key=' + geoApiKey)
        .then((response) => response.json())
        .then((responseJson) => {
        	this.updateStateWithGeo(responseJson, false)
		})
	}

	updateStateWithGeo(responseJson, updateText){
        const { dispatch } = this.props
    		console.log("updateStateWithGeo", responseJson)
        dispatch(updateGeo(responseJson, updateText))
	}

	onAddressChanged(addressText){
        const { dispatch } = this.props
        dispatch(changeAddressText(addressText))
	}

    validateData(){
        console.log("validateData", this.props)
        if(!this.props.addressText || !this.props.addressText.trim()){
            alert("Tienes que poner una direccion valida")
            return
        }
        if(!this.props.location){
            alert("Tienes que validar tu direccion, presiona el boton [Validar]")
            return
        }
        this.props.showNext()
    }

    onLocalityChange (locality) {
        console.log("onLocalityChange", locality)
        const { dispatch } = this.props
        dispatch(changeLocality(locality))
    }

    render() {
      const {
        options,
        locality,
        addressText,
        zones,
        price,
        location,
        cancelOrder,
        goBack,
        showNext,
        initialRegion
      } = this.props

        return (
        	<View style={{
                    width : "100%"
                }}>

                <View style={{
                            flex : 1,
                            alignItems : 'center'
                        }}>

	                    <TopBarPrice
	                    	options={options}
	                    	price={price}/>
                        <View style={Styles.textFieldHolder} >
                        	 <View style={{
                                alignItems : 'center',
                        	 	flex : 3}}>
	                        <RNPickerSelect
			                    placeholder={{
			                        label: 'LOCALIDAD',
			                        value: '',
			                        color: Color.black
			                    }}
			                    hideIcon={true}
			                    useNativeAndroidPickerStyle={false}
			                    placeholderTextColor={Color.darkGray}
			                    items={zones}
			                    onValueChange={this.onLocalityChange.bind(this)}
			                    onUpArrow={() => {
			                        this.inputRefs.name.focus();
			                    }}
			                    onDownArrow={() => {
			                        this.inputRefs.picker2.togglePicker();
			                    }}
			                    style={{...pickerSelectStyles}}
			                    value={locality}
			                    ref={(el) => {
			                        this.inputRefs.picker = el;
			                    }}
			                />
                            <EstudioText style={{
                                        fontSize : 10,
																				fontFamily : 'bold'
                                    }} text={"LOCALIDAD"}/>
			             </View>

                        </View>

                        <View style={Styles.textFieldHolder}>
                             <View style={{
                                alignItems : 'center',
                                width : "90%",
                                flex : 1}}>
                                    <EstudioTextInput
                                        placeholder={"DIRECCION EXACTA"}
                                        value={addressText}
                                        onChangeText={this.onAddressChanged.bind(this)}
                                        style={Styles.inputText} />


                                    <EstudioText style={{
                                        fontSize : 10,
																				fontFamily : 'bold'
                                    }} text={"COLOCAR DIRECCION EXACTA (CON PISO, TIMBRE, DEPARTAMENTO)"}/>
                            </View>
                        </View>
                        <EstudioButton1
                                onPress={this.validate.bind(this)}
                                text={"Validar"}
                                textStyle={{
                                    textAlign : 'center',
                                    color : Color.white,
                                    fontSize : 14,
                                }}
                                buttonStyle={Styles.validateBtn}
                            />
                    </View>

		        <MapView
			        style={{
			        	height : 308,
			        	marginStart : 20,
			        	marginEnd : 20,
			        	marginTop : 30
			        }}
			        provider="google"
			        onRegionChangeComplete={(region) => {
						console.log(" region", region)
					}}
			        region={location}
			        initialRegion={initialRegion}
			      >
				    {location && <MapView.Marker draggable
				      coordinate={location}
				      title={"Place"}
				      onDragEnd={(e) => {
				      	this.getGeoLocation(e.nativeEvent.coordinate)
				      	this.setState({ x: e.nativeEvent.coordinate })
				      }}
				      description={"Location"}
				    />}
			      </MapView>


						<EstudioText text={'EN CASO DE NO SER LA DIRECCION, CORRIJA Y VUELVA A VALIDAR'} style={Styles.subtitle}/>
            <NavigationOrder
              onCancel={cancelOrder}
              onNext={this.validateData.bind(this)}
              onBack={goBack}
            />
          </View>

        );
    }
}

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        width : "100%",
        textAlign : 'center',
        height : "100%",
        marginStart : 0,
        marginEnd : 0,
        color : Color.black,
        backgroundColor : Color.lightGray,
        borderRadius : 12,
        fontSize : 18,
    },
    inputAndroid: {
        textAlign : 'center',
        marginStart : 0,
        height : "100%",
        marginEnd : 0,
        color : Color.black,
        backgroundColor : Color.lightGray,
        borderRadius : 12,
        fontSize : 18,
    },
});


const Styles = StyleSheet.create({
	mainIcons : {
		width : "100%",
		flexDirection : 'row'

	},
	textFieldHolder : {
        alignItems : 'center',
        flex : 1,
        width : "80%",
        marginTop : 20,
        flexDirection : 'row',
        paddingBottom : 2
    },
     topBar : {
        width : win.width,
        height : 50,
        flexDirection : 'row',
        alignItems : 'center',
        justifyContent : 'center',
        backgroundColor : Color.gray
      },

      input : {
        backgroundColor : Color.white,
        borderRadius : 10,
        textAlign : 'center',
        fontWeight : '600',
        fontSize : 16,
        width : "35%",
        marginEnd : 10,
        color : Color.black,
        height : 32
      },
    inputText : {
        color : Color.black,
        backgroundColor : Color.lightGray,
        borderRadius : 12,
        fontSize : 18,
        paddingTop : 10,
        width : "100%",
        paddingBottom : 10,
        textAlign : 'center',
        marginEnd : 10,
        marginStart : 10
    },
    validateBtn : {
        backgroundColor : Color.darkBlue,
        borderRadius : 8,
        justifyContent : 'center',
        marginEnd : 10,
        height : 43,
        marginTop : 15,
        width : 81
    },
		subtitle : {
	    alignSelf : 'center',
	    fontSize : 8,
	    marginTop : 15,
			fontFamily : 'bold',
	    color : Color.darkGray
	  },
    buttonHolder : {
        flex : 1,
        marginTop : 40
    }
})

export default connect((state) => {
  return {
    user : state.user,
    orders : state.orders,
    options: getServicesSelector(state),
    zones: getDataSelector(state),
    locality: getLocalitySelector(state),
    addressText: getAddressTextSelector(state),
    location: getLocationSelector(state),
    initialRegion: getInitialRegionSelector(state)
  }
}, (dispatch) => {
  return {
    dispatch
  }
})(CreateOrderMap)
