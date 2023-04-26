const app = {
    state: {
        value: BigInt(51621),
        bits: 16
    },
    normalize(value) {
      const maxValue = BigInt(2) ** BigInt(this.bits);
      if (value >= BigInt(0)) {
        return value % maxValue;
      } else {
        return (value + maxValue) % maxValue;
      }
    },
    get value() {
        return this.state.value;
    },
    get bits() {
        return this.state.bits;
    },
    get unsignedValue() {
      return this.value;
    },
    get signedValue() {
      return this.value < BigInt(2) ** (BigInt(this.bits) - BigInt(1))
        ? this.value
        : this.value - BigInt(2) ** BigInt(this.bits);
    },
    get hexValue() {
      return this.value.toString(16);
    },
    get binaryValue() {
      return this.value.toString(2);
    },
    get paddedBinaryValue() {
      return this.binaryValue.padStart(this.bits, "0").split('');
    },
    form() {
        return tag.div({id: "app"},
            tag.div({style: {display: "flex"}},
                tag.div({style: {margin: "auto"}},
                    tag.span({class: ["toggle", this.bits ==  8 ? "selected" : ""]}, " 8 bit "),
                    tag.span({class: ["toggle", this.bits == 16 ? "selected" : ""]}, " 16 bit "),
                    tag.span({class: ["toggle", this.bits == 32 ? "selected" : ""]}, " 32 bit "),
                    tag.span({class: ["toggle", this.bits == 64 ? "selected" : ""]}, " 64 bit ")
                )
            ),

            tag.div(
                tag.div({class: "bit-pattern-wrapper"},
                    tag.div({class: "title", style: {"text-align": "center"}}, "Bit Pattern"),
                    tag.div({class: "bit-container", style: {display: "flex"}},
                        tag.div({style: {margin: "auto"}},
                            // Create an array of length 1, 2, 4 or 8 elements, dependend on the number of bytes
                            Array.from(Array(this.bits / 8)).map( (element, index) =>
                                tag.span({class: "byte"}, this.paddedBinaryValue.slice(index * 8, (index * 8) + 8).map( 
                                    item => tag.span({ class: "bit"}, ""+item) ) )
                            )
                        )
                    )
                ),

                tag.div({class: "button-wrapper"},
                    tag.button({class: "button", "data-tooltip": "Increment"}, "+"),
                    tag.button({class: "button", "data-tooltip": "Decrement"}, "-"),
                    tag.button({class: "button", "data-tooltip": "Left Shift"}, "<<"),
                    tag.button({class: "button", "data-tooltip": "Signed Right Shift"}, ">>"),
                    tag.button({class: "button", "data-tooltip": "Unsigned Right Shift"}, ">>>"),
                    tag.button({class: "button", "data-tooltip": "NOT"}, "~"),
                    tag.button({class: "button", "data-tooltip": "Swap byte order"}, "↔")
                ),

                tag.hr(),

                tag.div({style: {display: "flex"}},
                    tag.div({style: {margin: "auto"}, class: "values-wrapper"},
                        tag.div(
                            tag.div({class: "title"}, "Signed Value"),
                            tag.div({class: "input-container"},
                                tag.input({type: "text", class: "input-box", value: this.signedValue})
                            )
                        ),

                        tag.div(
                            tag.div({class: "title"}, "Unsigned Value"),
                            tag.div({class: "input-container"},
                                tag.input({type: "text", class: "input-box", value: this.unsignedValue})
                            )
                        ),

                        tag.div(
                            tag.div({class: "title"}, "Binary Value"),
                            tag.div({class: "input-container"},
                                tag.input({type: "text", class: "input-box", value: this.binaryValue})
                            )
                        ),

                        tag.div(
                            tag.div({class: "title"}, "Hexadecimal Value"),
                            tag.div({class: "input-container"},
                                tag.input({type: "text", class: "input-box", value: this.hexValue})
                            )
                        )
                    )
                )
            )
        );
    },
    mount(container) {
        document.querySelector(container).replaceWith(this.form())
    }
}
app.mount('#app');

