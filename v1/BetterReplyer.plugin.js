//META {"name": "BetterReplyer", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/plugins/BetterReplyer.plugin.js"} *//

/**
 * BetterReplyer plugin class
 * @author Zerthox
 * @version 3.1.0
 */
class BetterReplyer {

	/**
	 * @return {string} plugin name
	 */
	getName() {
		return "BetterReplyer";
    }
    
    /**
     * @return {*} plugin description
     */
	getDescription() {
		return BdApi.React.createElement("span", {style: {"white-space": "pre-line"}},
			"Reply to people using their ID with a button.\n Inspired by ",
			BdApi.React.createElement("a", {href: "https://github.com/cosmicsalad/Discord-Themes-and-Plugins/blob/master/plugins/replyer.plugin.js", target: "_blank"}, "Replyer"),
			" by ",
			BdApi.React.createElement("a", {href: "https://github.com/cosmicsalad", target: "_blank"}, "@Hammock#3110"),
			", ",
			BdApi.React.createElement("a", {href: "https://github.com/Delivator", target: "_blank"}, "@Natsulus#0001"),
			" & ",
			BdApi.React.createElement("a", {href: "https://github.com/rauenzi", target: "_blank"}, "@Zerebos#7790"),
			"."
		);
    }
    
    /**
     * @return {string} plugin version
     */
	getVersion() {
		return "3.1.0";
	}
    /**
     * @return {*} plugin author
     */
	getAuthor() {
		return BdApi.React.createElement("a", {href: "https://github.com/Zerthox", target: "_blank"}, "Zerthox");
	}

	/**
	 * plugin class constructor
	 */
	constructor() {

		/**
		 * object with selectors
		 */
		this.selector = {
			messageHeader: `.${BdApi.findModuleByProps("messagesWrapper", "messages").messages.split(" ")[0]} .${BdApi.findModuleByProps("headerCozyMeta").headerCozyMeta.split(" ")[0]}`,
			channelTextarea: `.${BdApi.findModuleByProps("channelTextArea", "textArea").textArea.split(" ")[0]}`,
			channelTextareaDisabled: `.${BdApi.findModuleByProps("channelTextArea", "textAreaDisabled").textAreaDisabled.split(" ")[0]}`,
			messageContainer: `.${BdApi.findModuleByProps("containerCozy").containerCozy.split(" ")[0]}`
		};

		/**
		 * plugin styles
		 */
		this.css = `/* BetterReplyer CSS */
			.replyer {
				position: relative;
				top: -1px;
				margin-left: 5px;
				padding: 3px 5px;
				background: rgba(0, 0, 0, 0.4);
				border-radius: 3px;
				color: #fff !important;
				font-size: 10px;
				text-transform: uppercase;
				cursor: pointer;
			}
			${this.selector.messageContainer}:not(:hover) .replyer {
				visibility: hidden;
			}`;

		/**
		 * object with plugin state relevant stuff
		 */
		this.state = {
			/**
			 * clicked element save
			 */
			clicked: document.body,

			/**
			 * focused textarea save
			 */
			focused: null,

			/**
			 * reply mode
			 */
			mode: false
		}

		/**
		 * object with handlers
		 */
		this.handler = {

			/**
			 * document click handler
			 */
			click: (e) => {

				// save event target
				this.state.clicked = e.target;
			},

			/**
			 * textarea blur handler
			 */
			blur: (e) => {

				// save event target
				this.state.focused = e.target;

				// update reply mode
				this.state.mode = this.state.clicked.matches(`${this.selector.messageHeader} .replyer`) ? true : false;
			}
		};
	}

	 /**
     * plugin start function
     */
	start() {

		// inject styles
		BdApi.injectCSS(this.getName(), this.css);

		// add click handler
		document.addEventListener("mousedown", this.handler.click);

        // iterate over all message headers
        for (var e of document.querySelectorAll(this.selector.messageHeader)) {

            // insert reply button
            this.insert(e);
		}

		// iterate over all textareas
		for (var e of document.querySelectorAll(this.selector.channelTextarea)) {

			// add blur handler
			e.addEventListener("blur", this.handler.blur);
		}

        // console output
		console.log(`[${this.getName()}] Enabled`);
    }
    
    /**
     * plugin stop function
     */
	stop() {

		// remove styles
		BdApi.clearCSS(this.getName());

		// remove click handler
		document.removeEventListener("mousedown", this.handler.click);

        // iterate over all message headers
        for (var e of document.querySelectorAll(`${this.selector.messageHeader} .replyer`)) {

            // remove reply button
            e.remove();
		}

		// iterate over all textareas
		for (var e of document.querySelectorAll(this.selector.channelTextarea)) {

			// remove blur handler
			e.removeEventListener("blur", this.handler.blur);
		}

		// reset state
		this.state = {
			clicked: document.body,
			focused: null,
			mode: false
		}
		
        // console output
		console.log(`[${this.getName()}] Disabled`);
	}

	/**
	 * plugin DOM observer
	 * @param {*} e event
	 */
	observer(e) {

		// check if channel textarea is disabled
		if (document.querySelector(this.selector.channelTextareaDisabled) === null) {
			
			// iterate over added nodes
			for (var n of e.addedNodes) {
				
				// check if node is html element
				if (n instanceof HTMLElement) {
					
					// check if added nodes contain message header or textarea
					if (n.matches(this.selector.messageHeader)) {
						
						// insert directly into message header
						this.insert(n);
					}
					else if (n.matches(this.selector.channelTextarea)) {
						
						// add blur handler directly to textarea
						n.addEventListener("blur", this.handler.blur);
					}
					else {
						
						// search for descendant message headers
						var l = n.findAll(this.selector.messageHeader);
						if (l.length > 0) {
							
							// insert into descendant message headers
							for (var m of l) {
								this.insert(m);
							}
						}
						
						// search for descendant textareas
						l = n.findAll(this.selector.channelTextarea);
						if (l.length > 0) {
							
							// add blur handler to descendant textareas
							for (var t of l) {
								t.addEventListener("blur", this.handler.blur);
							}
						}
					}
				}
			}
		}
	}

	/**
	 * insert reply button into passed message header
	 * @param {HTMLElement} e message header
	 */
	insert(e) {

		// get message author id
		var id = BdApi.getInternalInstance(e).child.memoizedProps.message.author.id;

		// check if message is sent by user
		if (id != BdApi.findModuleByProps("getCurrentUser").getCurrentUser().id) {
	
			// create reply button element
			var b = document.createElement("span");
			
			// set reply button class
			b.className = "replyer";
			
			// set reply button text
			b.innerHTML = "Reply";
			
			// add event listener
			b.addEventListener("click", () => {

				// get last focused textarea or default to first textarea found
				var t = this.state.focused instanceof HTMLElement ? this.state.focused : document.querySelector(this.selector.channelTextarea);
					
				// get mention string
				var m = `<@!${id}>`;

				// focus textarea
				t.focus();

				// check which mode to use
				if (this.state.mode) {

					// insert directly
					document.execCommand("insertText", false, m);
				}
				else {

					// add space to mention string
					m += " ";

					// save selection
					var ts = t.selectionStart + m.length,
						te = t.selectionEnd + m.length;
				
					// go to start of textarea
					t.selectionEnd = 0;
				
					// insert mention
					document.execCommand("insertText", false, m);
				
					// select saved selection
					t.setSelectionRange(ts, te);
				}
			});
			
			// append reply button
			e.appendChild(b);
		}
	}

}