const after_enter = (fn) => { 
  return ($event) => {
    if ($event.key === 'Enter' || $event.keyCode === 13) {
      fn($event);
    }
  }
}
const app = {
  state: {
    value: BigInt(0),
    bits: 16
  },
  get value() {
    return this.state.value;
  },
  set value(val) {
    this.state.value = val;
    this.setHash();
  },
  get bits() {
    return this.state.bits;
  },
  set bits(n) {
    this.state.bits = n;
    this.value = this.normalize(this.value);
    this.setHash();
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
  get paddedHexValue() {
    return this.hexValue.padStart(this.bits / 4, "0");
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
  normalize(value, bits) {
    // Make sure `value` fits within the selected bits,
    // and convert signed values to their unsigned counterpart,
    // since normalized values are stored as unsigned values.
    const maxValue = BigInt(2) ** BigInt(typeof bits=='undefined' ? this.bits : bits);
    if (value >= BigInt(0)) {
      return value % maxValue;
    } else {
      return (value + maxValue) % maxValue;
    }
  },
  toggleBitAsHex(index) {
    const bitValue = BigInt(2) ** BigInt(this.bits - index - 1);
    const value = this.normalize(this.value ^ bitValue);
    return value.toString(16).padStart(this.bits / 4, "0");
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
  run_fx() {
    // https://mastodon.social/@dukoid/110403616690465482
    // Would you mind adding a button that changes the value to 3x+1 if there are no trailing zeros, 
    // otherwise shifts right until there are no trailing zeros?
    // I always wanted to take a look at what the Collatz Cojecture looks in binary O:)
    const predefined_f = (value, bits) => {
      if (value != 0n) {
        if ((value & 1n) != 0n) {
          value = (value * 3n) + 1n;
        }
        else {
          while ((value & 1n) == 0n) {
            value = value / 2n
          }
        }
      }
      return value
    }
    if (!localStorage.fx) {
      localStorage.fx = String(predefined_f);
    }
    try {
      const the_f_in_fx = eval(localStorage.fx);
      this.value = this.normalize(the_f_in_fx(this.value, this.bits));
    }
    catch(error) {
      console.error("Error executing custom code from localStorage:", error);
    }
  },
  clear(alternate) {
    this.hexValue = alternate ? 'ffffffff' : '0';
  },
  form() {
    return tag.div({id: "app"},
      tag.div({style: {display: "flex"}},
        tag.div({style: {margin: "auto"}},
          [8, 16, 32, 64].map( nr_of_bits =>
            tag.button({ class: ["toggle", this.bits == nr_of_bits ? "selected" : ""], 
                id: `tab-${nr_of_bits}`, tabindex: 0,
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
                  (bit_item, bit_index) => tag.a(
                    { class: "bit", id: `bit-${bit_index + byte_index*8}`, tabindex: 0,
                      href: `#0x${this.toggleBitAsHex(bit_index + byte_index*8)}`
                    },
                    ""+bit_item
                  )
                ))
              )
            )
          )
        ),
        tag.div({class: "button-wrapper"},
          tag.button({class: "button", "id": "button-1", "data-tooltip": "Increment", click: e => this.render_after( () => this.increment() )}, "+"),
          tag.button({class: "button", "id": "button-2", "data-tooltip": "Decrement", click: e => this.render_after( () => this.decrement() )}, "-"),
          tag.button({class: "button", "id": "button-3", "data-tooltip": "Left Shift", click: e => this.render_after( () => this.signedLeftShift() )}, "<<"),
          tag.button({class: "button", "id": "button-4", "data-tooltip": "Signed Right Shift", click: e => this.render_after( () => this.signedRightShift() )}, ">>"),
          tag.button({class: "button", "id": "button-5", "data-tooltip": "Unsigned Right Shift", click: e => this.render_after( () => this.rightShift() )}, ">>>"),
          tag.button({class: "button", "id": "button-6", "data-tooltip": "NOT", click: e => this.render_after( () => this.not() )}, "~"),
          tag.button({class: "button", "id": "button-7", "data-tooltip": "Swap byte order", click: e => this.render_after( () => this.swap() )}, "↔"),
          tag.button({class: "button", "id": "button-8", "data-tooltip": "Programmable; see localStorage('fx')", click: e => this.render_after( () => this.run_fx() )}, "fx"),
          tag.button({class: "button", "id": "button-9", "data-tooltip": "Clear", click: e => this.render_after( () => this.clear(e.altKey) )}, "C")
        ),
        tag.hr(),
        tag.div({style: {display: "flex"}},
          tag.div({style: {margin: "auto"}, class: "values-wrapper"},
            tag.div(
              tag.div({class: "title"}, "Signed Value"),
              tag.div({class: "input-container"},
                tag.input({ type: "text", id: "input-1", class: "input-box", value: this.signedValue,
                  change: e => this.render_after( () => this.signedValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.signedValue = e.target.value))
                })
              )
            ),
            tag.div(
              tag.div({class: "title"}, "Unsigned Value"),
              tag.div({class: "input-container"},
                tag.input({type: "text", id: "input-2", class: "input-box", value: this.unsignedValue,
                  change: e => this.render_after( () => this.unsignedValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.unsignedValue = e.target.value))
                })
              )
            ),
            tag.div(
              tag.div({class: "title"}, "Binary Value"),
              tag.div({class: "input-container"},
                tag.input({type: "text", id: "input-3", class: "input-box", value: this.binaryValue,
                  change: e => this.render_after( () => this.binaryValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.binaryValue = e.target.value))
                })
              )
            ),
            tag.div(
              tag.div({class: "title"}, "Hexadecimal Value"),
              tag.div({class: "input-container"},
                tag.input({type: "text", id: "input-4", class: "input-box", value: this.hexValue,
                  change: e => this.render_after( () => this.hexValue = e.target.value  ),
                  keyup: after_enter( (e) => this.render_after( () => this.hexValue = e.target.value))
                })
              )
            )
          )
        )
      )
    );
  },
  getStateFromHash() {
    const hash = window.location.hash.substring('#0x'.length);
    const hexRegex = /^[0-9A-Fa-f]+$/;

    if (hexRegex.test(hash)) {
      const bits = hash.length * 4;
      const value = this.normalize(BigInt("0x" + hash), bits);
      return { value, bits};
    }
    return null;
  },
  onHashChange() {
    if (this.settingHash) {
      delete this.settingHash;
      return;
    }
    const state = this.getStateFromHash();
    if (state) {
      this.state = state;
      this.render();
    }
  },
  setHash() {
    this.settingHash = true;
    window.location.hash = "0x" + this.paddedHexValue;
  },
  render_after(fn) {
    fn();
    this.render();
  },
  render() {
    //console.info('render called');
    // Defer rendering, so we know activeElement in all cases (blur/change on text-inputs)
    window.setTimeout( () => {
      let activeElementId = document.activeElement?.id;
      document.querySelector(this.container).replaceWith(this.form())
      if (activeElementId) {
        document.getElementById(activeElementId)?.focus();
      }
    });
  },
  mount(container) {
    this.container = container;
    this.state = this.getStateFromHash() || this.state;
    this.render();
    window.addEventListener("hashchange", e => this.onHashChange());
  }
}
app.mount('#app');

