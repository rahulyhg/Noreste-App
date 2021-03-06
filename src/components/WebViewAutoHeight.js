import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {WebView, View, Text, Platform} from "react-native";
import Dimensions from 'Dimensions';
// import {colors, measures} from '../settings';

const deviceWidth = Dimensions.get('window').width;
// console.log (deviceWidth);
const BODY_TAG_PATTERN = /\<\/ *body\>/;

var script = `
;(function() {
    var wrapper = document.createElement("div");
    wrapper.id = "height-wrapper";
    while (document.body.firstChild) {
        wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
    var i = 0;
    function updateHeight() {
        document.title = wrapper.clientHeight + 15;
        window.location.hash = ++i;
    }
    updateHeight();
    window.addEventListener("load", function() {
        updateHeight();
        setTimeout(updateHeight, 1000);
    });
    window.addEventListener("resize", updateHeight);
}());
`;


const style = `
<script>
${script}
</script>
`;

const codeInject = (html) => html.replace(BODY_TAG_PATTERN, style + "</body>");

class WebViewAutoHeight extends Component{


    constructor(props){
        super(props);

        this.state = {
            realContentHeight: this.props.minHeight
        }
    }

    handleNavigationChange(navState) {
        if (navState && navState.title) {
            const realContentHeight = parseInt(navState.title, 10) || 0; // turn NaN to 0
            const realContentHeightR = Platform.OS === 'ios' ? realContentHeight : realContentHeight + 15;
            // realContentHeight = realContentHeight + 20;
            this.setState({realContentHeight});
        }
        if (typeof this.props.onNavigationStateChange === "function") {
            this.props.onNavigationStateChange(navState);
        }
    }

    render() {
        const {source, style, minHeight, ...otherProps} = this.props;
        const {realContentHeight} = this.state;
        const html = source.html;
        console.log(html,'here')
        if (!html) {
            throw new Error("WebViewAutoHeight supports only source.html");
        }

        if (!BODY_TAG_PATTERN.test(html)) {
            throw new Error("Cannot find </body> from: " + html);
        }

        console.log('wh',Math.max(this.state.realContentHeight, minHeight))

        return (
            // <View style={{height: Math.max(realContentHeight, minHeight)}}>
                <WebView
                    {...otherProps}
                    source={{html: codeInject(html)}}
                    scrollEnabled={false}
                    style={[{height: Math.max(realContentHeight, minHeight)},style]}
                    javaScriptEnabled
                    onNavigationStateChange={(data) => {
                        this.handleNavigationChange(data);
                    }}
                />
            // </View>
        );
    }

}


WebViewAutoHeight.propTypes = {
    source: PropTypes.object.isRequired,
    injectedJavaScript: PropTypes.string,
    minHeight: PropTypes.number,
    onNavigationStateChange: PropTypes.func,
    style: WebView.propTypes.style
};

WebViewAutoHeight.defaultProps = {
    minHeight: 100
};

export default WebViewAutoHeight;