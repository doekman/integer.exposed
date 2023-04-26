const after_enter = (fn) => { 
  return ($event) => {
    if ($event.key === 'Enter' || $event.keyCode === 13) {
      fn($event);
    }
  }
}
const app = {
  state: {
    value: BigInt(51621),
    bits: 16
  },
  get value() {
    return this.state.value;
  },
  set value(val) {
    this.state.value = val;
  },
  get bits() {
    return this.state.bits;
  },
  set bits(n) {
    this.state.bits = n;
  },
  get unsignedValue() {
    return this.value;
  },
  set unsignedValue(val) {
    try {
      this.value = this.normalize(BigInt(val));
    } catch {
      // hack to reset everything to its normal value;
      this.increment();
      this.decrement();
    }
  },
  get signedValue() {
    return this.value < BigInt(2) ** (BigInt(this.bits) - BigInt(1))
      ? this.value
      : this.value - BigInt(2) ** BigInt(this.bits);
  },
  set signedValue(val) {
    try {
      this.value = this.normalize(BigInt(val));
    } catch {
      this.increment();
      this.decrement();
    }
  },
  get hexValue() {
    return this.value.toString(16);
  },
  set hexValue(val) {
    try {
      this.value = this.normalize(BigInt("0x" + val));
    } catch {
      this.increment();
      this.decrement();
    }
  },
  get binaryValue() {
    return this.value.toString(2);
  },
  set binaryValue(val) {
    try {
      this.value = this.normalize(BigInt("0b" + val));
    } catch {
      this.increment();
      this.decrement();
    }
  },
  get paddedBinaryValue() {
    return this.binaryValue.padStart(this.bits, "0").split('');
  },
  normalize(value) {
    // Make sure `value` fits within the selected bits,
    // and convert signed values to their unsigned counterpart,
    // since normalized values are stored as unsigned values.
    const maxValue = BigInt(2) ** BigInt(this.bits);
    if (value >= BigInt(0)) {
      return value % maxValue;
    } else {
      return (value + maxValue) % maxValue;
    }
  },
  toggleBit(index) {
    const bitValue = BigInt(2) ** BigInt(this.bits - index - 1);
    this.value = this.normalize(this.value ^ bitValue);
  },
  increment() {
    this.value = this.normalize(this.value + BigInt(1));
  },
  decrement() {
    this.value = this.normalize(this.value - BigInt(1));
  },
  signedLeftShift() {
    this.value = this.normalize(this.value * BigInt(2));
  },
  rightShift() {
    this.value = this.normalize(this.value / BigInt(2));
  },
  signedRightShift() {
    const binary = this.binaryValue.padStart(this.bits, "0");
    let shifted = binary.slice(0, -1);
    if (binary[0] === "1") {
      shifted = "1" + shifted;
    }
    this.binaryValue = shifted;
  },
  not() {
    const maxValue = BigInt(2) ** BigInt(this.bits) - BigInt(1);
    this.value = maxValue - this.value;
  },
  swap() {
    const binary = this.binaryValue.padStart(this.bits, "0");
    const swapped = binary.match(/.{8}/g).reverse().join("");
    this.binaryValue = swapped;
  },
  form() {
    return tag.div({id: "app"},
      tag.div({style: {display: "flex"}},
        tag.div({style: {margin: "auto"}},
          [8, 16, 32, 64].map( nr_of_bits =>
            tag.span({ class: ["toggle", this.bits == nr_of_bits ? "selected" : ""], 
                click: e => this.render_after( () => this.bits=nr_of_bits )
              },
              ` ${nr_of_bits} bit `
            )
          )
        )
      ),
      tag.div(
        tag.div({class: "bit-pattern-wrapper"},
          tag.div({class: "title", style: {"text-align": "center"}}, "Bit Pattern"),
          tag.div({class: "bit-container", style: {display: "flex"}},
            tag.div({style: {margin: "auto"}},
              // Create an array of length 1, 2, 4 or 8 dummy elements. Only the index is used.
              Array.from(Array(this.bits / 8)).map( (element, byte_index) =>
                tag.span({class: "byte"}, this.paddedBinaryValue.slice(byte_index * 8, (byte_index * 8) + 8).map( 
                  (bit_item, bit_index) => tag.span(
                    { class: "bit", 
                      click: e => this.render_after( () => this.toggleBit(bit_index + byte_index*8) )
                    },
                    ""+bit_item
                  )
                ))
              )
            )
          )
        ),
        tag.div({class: "button-wrapper"},
          tag.button({class: "button", "data-tooltip": "Increment", click: e => this.render_after( () => this.increment() )}, "+"),
          tag.button({class: "button", "data-tooltip": "Decrement", click: e => this.render_after( () => this.decrement() )}, "-"),
          tag.button({class: "button", "data-tooltip": "Left Shift", click: e => this.render_after( () => this.signedLeftShift() )}, "<<"),
          tag.button({class: "button", "data-tooltip": "Signed Right Shift", click: e => this.render_after( () => this.signedRightShift() )}, ">>"),
          tag.button({class: "button", "data-tooltip": "Unsigned Right Shift", click: e => this.render_after( () => this.rightShift() )}, ">>>"),
          tag.button({class: "button", "data-tooltip": "NOT", click: e => this.render_after( () => this.not() )}, "~"),
          tag.button({class: "button", "data-tooltip": "Swap byte order", click: e => this.render_after( () => this.swap() )}, "↔")
        ),
        tag.hr(),
        tag.div({style: {display: "flex"}},
          tag.div({style: {margin: "auto"}, class: "values-wrapper"},
            tag.div(
              tag.div({class: "title"}, "Signed Value"),
              tag.div({class: "input-container"},
                tag.input({ type: "text", class: "input-box", value: this.signedValue,
                  blur: e => this.render_after( () => this.signedValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.signedValue = e.target.value))
                })
              )
            ),
            tag.div(
              tag.div({class: "title"}, "Unsigned Value"),
              tag.div({class: "input-container"},
                tag.input({type: "text", class: "input-box", value: this.unsignedValue,
                  blur: e => this.render_after( () => this.unsignedValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.unsignedValue = e.target.value))
                })
              )
            ),
            tag.div(
              tag.div({class: "title"}, "Binary Value"),
              tag.div({class: "input-container"},
                tag.input({type: "text", class: "input-box", value: this.binaryValue,
                  blur: e => this.render_after( () => this.binaryValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.binaryValue = e.target.value))
                })
              )
            ),
            tag.div(
              tag.div({class: "title"}, "Hexadecimal Value"),
              tag.div({class: "input-container"},
                tag.input({type: "text", class: "input-box", value: this.hexValue,
                  blur: e => this.render_after( () => this.hexValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.hexValue = e.target.value))
                })
              )
            )
          )
        )
      )
    );
  },
  render_after(fn) {
    fn();
    this.render();
  },
  render() {
    document.querySelector(this.container).replaceWith(this.form())
  },
  mount(container) {
    this.container = container;
    this.render()
  }
}
app.mount('#app');

