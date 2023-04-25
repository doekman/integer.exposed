const app = {
    paddedBinaryValue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    form() {
        return tag.div({id: "app"},
            tag.div({style: {display: "flex"}},
                tag.div({style: {margin: "auto"}},
                    tag.span({class: "toggle"}, " 8 bit "),
                    tag.span({class: "toggle selected"}, " 16 bit "),
                    tag.span({class: "toggle"}, " 32 bit "),
                    tag.span({class: "toggle"}, " 64 bit ")
                )
            ),

            tag.div(
                tag.div({class: "bit-pattern-wrapper"},
                    /* I only implement 16 bits at this time (original: this is a mess but I couldn't think of a better way) */
                    tag.div({class: "title", style: {"text-align": "center"}}, "Bit Pattern"),
                    tag.div({class: "bit-container", style: {display: "flex"}},
                        tag.div({style: {margin: "auto"}},
                            tag.span({class: "byte"}, this.paddedBinaryValue.slice(0, 8).map( item => tag.span({ class: "bit"}, ""+item) ) ),
                            tag.span({class: "byte"}, this.paddedBinaryValue.slice(8, 16).map( item => tag.span({ class: "bit"}, ""+item) ) )
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
                                tag.input({type: "text", class: "input-box", value: "0"})
                            )
                        ),

                        tag.div(
                            tag.div({class: "title"}, "Unsigned Value"),
                            tag.div({class: "input-container"},
                                tag.input({type: "text", class: "input-box", value: "0"})
                            )
                        ),

                        tag.div(
                            tag.div({class: "title"}, "Binary Value"),
                            tag.div({class: "input-container"},
                                tag.input({type: "text", class: "input-box", value: "0"})
                            )
                        ),

                        tag.div(
                            tag.div({class: "title"}, "Hexadecimal Value"),
                            tag.div({class: "input-container"},
                                tag.input({type: "text", class: "input-box", value: "0"})
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

