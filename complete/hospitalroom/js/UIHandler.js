WL.registerComponent('uiHandler', {
    //panel: {type: WL.Type.Enum, values:['simple', 'buttons', 'scrolling', 'images', 'input-text'], default: 'simple'},
}, {
    init: function() {
    },
    start: function() {
        this.target = this.object.getComponent('cursor-target');
        this.target.addHoverFunction(this.onHover.bind(this));
        this.target.addUnHoverFunction(this.onUnHover.bind(this));
        this.target.addMoveFunction(this.onMove.bind(this));
        this.target.addDownFunction(this.onDown.bind(this));
        this.target.addUpFunction(this.onUp.bind(this));
        
        this.soundClick = this.object.addComponent('howler-audio-source', {src: 'sfx/click.wav', spatial: true});
        this.soundUnClick = this.object.addComponent('howler-audio-source', {src: 'sfx/unclick.wav', spatial: true});
        this.speech = this.object.addComponent('howler-audio-source', { spatial: false });

        fetch( 'json/questions.json' ).then( response => response.json() ).then( obj =>{
            this.questions = obj;
            this.createUI();
        });
    },
    
    playSound: function(name){
        this.speech.stop();
        this.speech.audio.unload();
        this.speech.audio = new Howl({
            src:[`sfx/${name}.mp3`],
            loop: false
        });
        this.speech.play();
    },

    createUI: function(){
        const headerHeight = 50;
        const panelHeight = 512;
        const footerHeight = headerHeight;
        
        const self = this;
        
        let questionIndex = -2;
        let answerIndex = 0;

        function showStart(){
            self.ui.updateElement( "header", "Instructions");
            self.ui.updateElement("panel", self.questions.start);
            self.ui.updateConfig("prev", "display", "none");
            self.ui.updateConfig("next", "display", "none");
            self.ui.updateElement("continue", "Start");
            questionIndex = 0;
            answerIndex = -1;
        }
        
        function showIntro(){
            self.ui.updateElement( "header", "Scenario 5");
            self.ui.updateElement("panel", self.questions.intro);
            self.ui.updateConfig("prev", "display", "none");
            self.ui.updateConfig("next", "display", "none");
            self.ui.updateElement("continue", "Continue");
            self.playSound(`intro`); 
            questionIndex = 0;
            answerIndex = -1;
        }
        
        function showOption(){
            const options = self.questions.questions[questionIndex].options;
            if (answerIndex<0) answerIndex = 0;
            if (answerIndex>=options.length) answerIndex = options.length - 1;
            let display = (answerIndex>0) ? "block" : "none";
            self.ui.updateConfig("prev", "display", display);
            display = (answerIndex<(options.length-1)) ? "block" : "none";
            self.ui.updateConfig("next", "display", display);
            self.ui.updateElement( "header", "Select a response");
            self.ui.updateElement("panel", options[answerIndex].text);
        }
        
        function showQuestion(){
            const question = self.questions.questions[questionIndex];
            self.ui.updateElement( "header", "Heather");
            self.ui.updateElement("panel", question.text);
            self.ui.updateConfig("prev", "display", "none");
            self.ui.updateConfig("next", "display", "none");
            self.playSound(`option${questionIndex + 1}`);
        }
        
        function onPrev(){
            answerIndex--;
            showOption();
        }
        
        function onNext(){
            answerIndex++;
            showOption();
        }
        
        function onContinue(){
            if (questionIndex<-1){
                questionIndex = -1;
                showIntro();
            }else if (questionIndex<0){
                //Coming from intro
                questionIndex = 0;
                showQuestion()
                answerIndex = -1;
            }else if (answerIndex==-1){
                //Show first option
                answerIndex = 0;
                showOption();
            }else{
                //Option selected
                const question = self.questions.questions[questionIndex];
                questionIndex = question.options[answerIndex].next;
                if (questionIndex==-1){
                    showIntro();
                }else{
                    answerIndex = -1;
                    showQuestion();
                }
            }
        }
        
        const config = {
            panelSize: { width: 0.5, height: 0.8 },
            width: 512,
            height: panelHeight,
            body:{
                fontFamily:'Arial', 
                fontSize:30, 
                padding:20, 
                backgroundColor: '#000', 
                fontColor:'#fff', 
                borderRadius: 6,
                border:{ width: 2, color:"#fff", style:"solid" },
                opacity: 0.7
            },
            header:{
                type: "text",
                position:{ x:0, y:0 },
                height: headerHeight
            },
            panel:{
                type: "text",
                position:{ x:0, y:headerHeight },
                height: panelHeight - headerHeight - footerHeight,
                backgroundColor: "#ffa",
                fontColor: "#000",   
                overflow: "scroll", 
                leading: 5
            },
            prev:{
                display: 'none',
                type: "button",
                position: { x:0, y: panelHeight - footerHeight + 5},
                width: footerHeight,
                height: footerHeight,
                fontColor: "#ff4",
                onSelect: onPrev
            },
            next:{
                display: 'none',
                type: "button",
                position: { x:footerHeight, y: panelHeight - footerHeight + 5},
                width: footerHeight,
                height: footerHeight,
                fontColor: "#ff4",
                onSelect: onNext
            },
            continue:{
                type: "button",
                position: { x:212, y: panelHeight - footerHeight },
                textAlign: "right",
                width: 300,
                height: footerHeight,
                hover: "#ff0",
                fontColor: "#ff4",
                onSelect: onContinue
            }
        }
        
        const content = {
            header: "Instructions",
            panel: self.questions.start,
            prev: "<path>m 5 20 l 35 35 l 35 5 z</path>",
            next: "<path>m 35 20 l 5 5 l 5 35 z</path>",
            continue: "Start"
        }
        
        const ui = new CanvasUI( content, config, this.object );
        this.ui = ui;
    },

    onHover: function(_, cursor) {
        //console.log('onHover');
        if (this.ui){
            const xy = this.ui.worldToCanvas(cursor.cursorPos);
            this.ui.hover(0, xy);
        }

        if(cursor.type == 'finger-cursor') {
            this.onDown(_, cursor);
        }

        this.hapticFeedback(cursor.object, 0.5, 50);
    },

    onMove: function(_, cursor) {
        if (this.ui){
            const xy = this.ui.worldToCanvas(cursor.cursorPos);
            this.ui.hover(0, xy);
        }

        this.hapticFeedback(cursor.object, 0.5, 50);
    },

    onDown: function(_, cursor) {
        console.log('onDown');
        this.soundClick.play();

        this.hapticFeedback(cursor.object, 1.0, 20);
    },

    onUp: function(_, cursor) {
        console.log('onUp');
        this.soundUnClick.play();

        if (this.ui) this.ui.select( 0, true );

        this.hapticFeedback(cursor.object, 0.7, 20);
    },

    onUnHover: function(_, cursor) {
        console.log('onUnHover');
        
        if (this.ui) this.ui.hover(0);

        this.hapticFeedback(cursor.object, 0.3, 50);
    },

    onHoverKeyboard: function(_, cursor) {
        //console.log('onHover');
        if (!this.ui || !this.ui.keyboard || !this.ui.keyboard.keyboard) return;

        const ui = this.ui.keyboard.keyboard;
        const xy = ui.worldToCanvas(cursor.cursorPos);
        ui.hover(0, xy);

        if(cursor.type == 'finger-cursor') {
            this.onDown(_, cursor);
        }

        this.hapticFeedback(cursor.object, 0.5, 50);
    },

    onMoveKeyboard: function(_, cursor) {
        if (!this.ui || !this.ui.keyboard || !this.ui.keyboard.keyboard) return;

        const ui = this.ui.keyboard.keyboard;
        const xy = ui.worldToCanvas(cursor.cursorPos);
        ui.hover(0, xy);

        this.hapticFeedback(cursor.object, 0.5, 50);
    },

    onUpKeyboard: function(_, cursor) {
        console.log('onUpKeyboard');
        this.soundUnClick.play();

        if (this.ui && this.ui.keyboard && this.ui.keyboard.keyboard) this.ui.keyboard.keyboard.select(0);

        this.hapticFeedback(cursor.object, 0.7, 20);
    },

    onUnHoverKeyboard: function(_, cursor) {
        console.log('onUnHoverKeyboard');
        
        if (this.ui && this.ui.keyboard && this.ui.keyboard.keyboard) this.ui.keyboard.keyboard.hover(0);

        this.hapticFeedback(cursor.object, 0.3, 50);
    },

    hapticFeedback: function(object, strength, duration) {
        const input = object.getComponent('input');
        if(input && input.xrInputSource) {
            const gamepad = input.xrInputSource.gamepad;
            if(gamepad && gamepad.hapticActuators) gamepad.hapticActuators[0].pulse(strength, duration);
        }
    },
    
    update: function(dt) {
        //console.log('update() with delta time', dt);
        if (this.ui) this.ui.update();
    },
});
