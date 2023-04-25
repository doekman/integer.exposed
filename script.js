const app = Vue.createApp({
  data() {
    return {
      value: BigInt(0),
      bits: 16,
    };
  },
  mounted() {
    window.addEventListener("hashchange", this.onHashChange);
    this.onHashChange(); // set the initial values from the hash
  },
  computed: {
    unsignedValue() {
      return this.value;
    },
    signedValue() {
      return this.value < BigInt(2) ** (BigInt(this.bits) - BigInt(1))
        ? this.value
        : this.value - BigInt(2) ** BigInt(this.bits);
    },
    hexValue() {
      return this.value.toString(16);
    },
    binaryValue() {
      return this.value.toString(2);
    },
    paddedBinaryValue() {
      return this.binaryValue.padStart(this.bits, "0");
    },
  },
  methods: {
    normalize(value) {
      const maxValue = BigInt(2) ** BigInt(this.bits);
      if (value >= BigInt(0)) {
        return value % maxValue;
      } else {
        return (value + maxValue) % maxValue;
      }
    },
    setBits(n) {
      this.bits = n;
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
      this.setBinaryValue(shifted);
    },
    not() {
      const maxValue = BigInt(2) ** BigInt(this.bits) - BigInt(1);
      this.value = maxValue - this.value;
    },
    swap() {
      const binary = this.binaryValue.padStart(this.bits, "0");
      const swapped = binary.match(/.{8}/g).reverse().join("");
      this.setBinaryValue(swapped);
    },
    setUnsignedValue(val) {
      try {
        this.value = this.normalize(BigInt(val));
      } catch {
        // hack to reset everything to its normal value;
        this.increment();
        this.decrement();
      }
    },
    setSignedValue(val) {
      try {
        this.value = this.normalize(BigInt(val));
      } catch {
        this.increment();
        this.decrement();
      }
    },
    setBinaryValue(val) {
      try {
        this.value = this.normalize(BigInt("0b" + val));
      } catch {
        this.increment();
        this.decrement();
      }
    },
    setHexValue(val) {
      try {
        this.value = this.normalize(BigInt("0x" + val));
      } catch {
        this.increment();
        this.decrement();
      }
    },
    onHashChange() {
      const hash = window.location.hash.substring(3);
      const hexRegex = /^[0-9A-Fa-f]+$/;

      if (hexRegex.test(hash)) {
        const bits = hash.length * 4;
        this.setBits(bits);
        this.setHexValue(hash);
      }
    },
    setHash() {
      window.location.hash = "0x" + this.hexValue.padStart(this.bits / 4, "0");
    },
  },
  watch: {
    value() {
      this.setHash();
    },
    bits() {
      this.value = this.normalize(this.value);
      this.setHash();
    },
  },
});
app.mount("#app");
