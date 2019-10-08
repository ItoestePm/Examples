
import React from 'react'
import {connect} from 'react-redux'

import {
    View,
    Dimensions,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native'

import Color from 'app/utils/Color'
import CreateOrderServices from './CreateOrderServices'
import CreateOrderTypeAndDetails from './CreateOrderTypeAndDetails'
import CreateOrderConfirm from './CreateOrderConfirm'
import CreateOrderMap from './CreateOrderMap'
import { getSelectedServicesInfoSelector } from 'app/redux/selectors/new-order/createOrder'

class CreateOrder extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        showNext : 0
      }
    }

    componentDidMount(){
      console.log("componentDidMount =====>")
    }

    componentWillUnmount(){
      console.log("componentWillUnmount =====>")
      this.clearScrollTimeout()
    }

    goBack(){
      this.state.showNext--
      this.setState({
        showNext : this.state.showNext,
      })
    }

    showNext(){
      this.state.showNext++
      this.setState({
        showNext : this.state.showNext
      })
    }

    clearScrollTimeout(){
       if(this.scrollTimeout){
          clearTimeout(this.scrollTimeout)
          this.scrollTimeout = null
        }
    }

    onCreateOrder(){
      //Reset to first screen to prevent crash
      this.state.showNext = 0
      this.props.onClose && this.props.onClose()
    }

    render() {
      const {
        hours,
        price,
        min,
        duration
      } = this.props

      let content = [
        (
          <CreateOrderServices
            showNext={this.showNext.bind(this)}
            cancelOrder={this.props.onClose.bind(this)}
            hours={hours}
            price={price}
            min={min}
            duration={duration}
          />
        ),
        (
          <CreateOrderMap
            goBack={this.goBack.bind(this)}
            showNext={this.showNext.bind(this)}
            cancelOrder={this.props.onClose.bind(this)}
            hours={hours}
            price={price}
            min={min}
            duration={duration}
          />
        ),
        (
          <CreateOrderTypeAndDetails
            goBack={this.goBack.bind(this)}
            showNext={this.showNext.bind(this)}
            cancelOrder={this.props.onClose.bind(this)}
            hours={hours}
            price={price}
            min={min}
            duration={duration}
          />
        ),
        (
          <CreateOrderConfirm
            goBack={this.goBack.bind(this)}
            showNext={this.showNext.bind(this)}
            cancelOrder={this.props.onClose.bind(this)}
            hours={hours}
            price={price}
            min={min}
            onCreateOrder={this.onCreateOrder.bind(this)}
            duration={duration}
            />
        )
      ]

      if(this.state.showNext < 0){
        this.state.showNext = 0
      }else if(this.state.showNext >= content.length){
        this.state.showNext = content.length - 1
      }

      if(this.state.showNext >= 1){
        this.clearScrollTimeout()
        if(this.currentScreen != this.state.showNext){
          this.currentScreen = this.state.showNext
          this.scrollTimeout = setTimeout(() => this.scrollView.scrollTo({x : 0, y : 0}), 200)
        }

      }
      return (

            <ScrollView contentContainerStyle={{
              alignItems : 'center'
            }}
            ref={ref => this.scrollView = ref}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
                <View style={{
                    backgroundColor: Color.white,
                    flex : 1,
                    width : "100%",
                    alignItems : 'center',
                }}>
                  {content[this.state.showNext]}
                  </View>
              </TouchableWithoutFeedback>
            </ScrollView>

        );
    }
}


export default connect((state) => {
  return {
    user : state.user,
    ...getSelectedServicesInfoSelector(state)
  }
})(CreateOrder)
