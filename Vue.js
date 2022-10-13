
Vue.use(VueAudioRecorder)

var vm = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  components: { VueAudioRecorder },
  data: {
    fab_specials: () => ({
      direction: 'top',
      fab: false,
      fling: false,
      hover: false,
      tabs: null,
      top: false,
      right: true,
      bottom: true,
      left: false,
      transition: 'slide-y-reverse-transition',
    }),
    tts: "",
    ttsPitch: 1,
    ttsRate: 1,
    pesquisa: "",
    customtxt: "",
    audios: [],
    last_cancel: new Date(),
    sections: SoundData,
    snackbar: {
      visible: false,
      timeout: 2000
    },
    languages: [],
    language: null,
    _throwawayfirstcall: window.speechSynthesis,
  },
  methods: {
    callback(msg) {
      console.debug('Event: ', msg)
    },
    play: async (sound, log = true) => {
      const path = sound.file;
      if (sound.texto)
        vm.showSnackBar(sound.texto);
      var audio = new Audio("./audios_opus/" + path);
      vm.audios.push(audio);
      audio.playbackRate = vm.ttsRate;
      audio.preservesPitch = false;
      console.log(audio)
      await audio.play();
      if (log) {
        try {
          console.log('logging ' + audio)
          await fetch('http://risco13-sp01:8128', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: sound.name })
          })
        } catch (e) {
          console.log(e)
        }
      }
    },
    execute: (sound, log = true) => {
      if (sound.file != null) {
        vm.play(sound, log);
      } else {
        sound.func();
      }
    },
    getAllSounds: () => {
      var sounds = [];
      vm.sections.forEach((section) => {
        sounds.push(...section.sounds)
      })
      return sounds;
    },
    randBetween: (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    stopAll: () => {
      vm.last_cancel = new Date().getTime();
      vm.audios.forEach(element => {
        element.pause()
      });
    },
    playViveiro: () => {
      const sounds = vm.sections.filter((x) => x.name == 'VIVEIRO')[0].sounds;
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`Tocando o viveiro!`);
      for (let i = 0; i <= 10; i++) {
        const sleepTime = vm.randBetween(1, 10) * 1000;
        const whichOne = vm.randBetween(0, sounds.length - 1);
        setTimeout((when) => {
          if (vm.last_cancel < when) {
            console.log(`Tocando agora ${sounds[whichOne].name}`)
            vm.execute(sounds[whichOne], log = false);
          }
        }, sleepTime, firstWhen);
      }
    },
    playRioDeJaneiro: () => {
      const sounds = vm.sections.filter((x) => x.name == 'RIO DE JANEIRO')[0].sounds;
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`Tocando o Rio de Janeiro!`);
      for (let i = 0; i <= 10; i++) {
        const sleepTime = vm.randBetween(1, 10) * 1000;
        const whichOne = vm.randBetween(0, sounds.length - 1);
        setTimeout((when) => {
          if (vm.last_cancel < when) {
            console.log(`Tocando agora ${sounds[whichOne].name}`)
            vm.execute(sounds[whichOne], log = false);
          }
        }, sleepTime, firstWhen);
      }
    },
    hellbringer: () => {
      vm.showSnackBar(`Eita.`);
      vm.sections.forEach((section) => {
        section.sounds.forEach((sound) => {
          if (vm.last_cancel < new Date().getTime()) {
            vm.execute(sound, log = false);
          }
        })
      })
    },
    umahoradesilenciointerrompidaporsonsaleatoriamente: () => {
      const allSounds = vm.getAllSounds();
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`Hora de silêncio eventualmente interrompida por sons aleatórios agendada!`);
      var sleepTime = 0;
      while (true) {
        const sleepInterval = vm.randBetween(1, 600000);
        sleepTime += sleepInterval;
        if (sleepTime > 3600000) {
          break;
        }
        const whichOne = vm.randBetween(0, allSounds.length - 1);
        const when = new Date(new Date().getTime() + sleepTime);
        const whenstr = when.getHours().toString().padStart(2, '0') + ":" + when.getMinutes().toString().padStart(2, '0') + ":" + when.getSeconds().toString().padStart(2, '0')
        console.log(`Will play at ${whenstr}: ${allSounds[whichOne].name} (in ${(sleepTime / 60000).toFixed(2)}min)`)
        setTimeout((when) => {
          if (vm.last_cancel < when) {
            console.log(`Tocando agora ${allSounds[whichOne].name}`)
            vm.execute(allSounds[whichOne], log = false);
          }
        }, sleepTime, firstWhen);
      }
    },
    playRandomFiles: (name, files) => {
      const sound = {
        "name": name,
        "file": files[vm.randBetween(0, files.length - 1)]
      }
      vm.play(sound)
    },
    dorimeRandom: () => {
      const dorimes = ["dorime.opus", "dorime-eletro.opus", "dorime-funk.opus"];
      vm.playRandomFiles("DORIME RANDOM ", dorimes);
    },
    japanTapuiu: () => {
      const tapuius = ["bahia-radio-globo.opus", "shamisen.opus", "whatsapp-audio-2020-01-01-at-01_ehgBR2P.opus"];
      vm.playRandomFiles("SHAMISEN ", tapuius);
    },
    get_all_voices: () => {
      const synth = window.speechSynthesis;
      var voices = synth.getVoices();
      var names = []
      for (const voice of voices) {
        names.push(voice.name)
      }
      vm.languages = names;
    },
    get_voice: (name) => {
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const voice = voices.filter((x) => x.name == name)[0];
      return voice
    },
    set_selected_voice: (language) => {
      if (language === undefined || language === null)
        var language = null
      vm.language = vm.get_voice(language)
    },
    falar: async (texto = null) => {
      if (texto === undefined || texto === null)
        var texto = vm.tts;
      var synth = window.speechSynthesis;
      var utterThis = new SpeechSynthesisUtterance(texto);
      if (vm.language !== null)
        utterThis.voice = vm.language;
      await new Promise((resolve) => {
        utterThis.onend = resolve;
        utterThis.pitch = vm.ttsPitch;
        utterThis.rate = vm.ttsRate;
        synth.speak(utterThis);
      })
    },
    search: () => {
      var filter, i, txtValue;

      filter = vm.pesquisa.toUpperCase();
      buttons = document.getElementsByClassName("searchable")
      console.log(buttons)

      for (i = 0; i < buttons.length; i++) {
        txtValue = buttons[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          buttons[i].style.display = "";
        } else {
          buttons[i].style.display = "none";
        }
      }
    },
    isTheSoundNew: (item) => {
      return item.release_date != null && new Date().getTime() - new Date(item.release_date).getTime() < 259200000
    },
    howManyNewSounds: (section) => {
      var qtd = 0
      section.sounds.forEach((item) => {
        if (item.release_date != null && new Date().getTime() - new Date(item.release_date).getTime() < 259200000) {
          qtd += 1
        }
      })

      return qtd
    },
    showSnackBar: (text) => {
      vm.snackbar.visible = false;
      vm.snackbar.text = text;
      vm.snackbar.visible = true;
    },
    sanduiche: (text) => {
      vm.play({
        "name": "SANDUICHE-ICHE",
        "file": "sanduiche-iche.opus"
      });
      vm.play({
        "name": "SANDYUITI",
        "file": "sandiuiche.opus"
      });
    },
    joaoGostaNeJoaoJoaoGostaNeNeJoao: () => {
      vm.falar("João gosta né João, Né joão, você gosta né, joão, joão gosta né");
    },
    joaoRandom: () => {

      const sounds = ["João", "gosta", "né", "você gosta", "né João", "Você gosta né João"];
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`João gosta!`);
      const sleepTime = 0;
      for (let i = 0; i <= 10; i++) {
        const whichOne = vm.randBetween(0, sounds.length - 1);
        setTimeout(async (when) => {
          if (vm.last_cancel < when) {
            let som = sounds[whichOne];
            console.log(`Tocando agora ${som}`)
            await vm.falar(som);
          }
        }, sleepTime, firstWhen);
      }

    },
    lucasBoloRandom: () => {

      const sounds = ["Eron", "cadê", "cadê a coxinha", "Eron cadê", "a coxinha", "Eron cadê a coxinha"];
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`Eron cadê!`);
      const sleepTime = 0;
      for (let i = 0; i <= 10; i++) {
        const whichOne = vm.randBetween(0, sounds.length - 1);
        setTimeout(async (when) => {
          if (vm.last_cancel < when) {
            let som = sounds[whichOne];
            console.log(`Tocando agora ${som}`)
            await vm.falar(som);
          }
        }, sleepTime, firstWhen);
      }

    },
    customGosta: () => {
      var custom = vm.customtxt;
      vm.showSnackBar(`${custom} cadê!`);
      vm.falar(`${custom} gosta né ${custom}, Né ${custom}, você gosta né, ${custom}, ${custom} gosta né`);
    },
    customGostaRandom: () => {
      var custom = vm.customtxt;

      const sounds = [custom, "gosta", "né", "você gosta", `né ${custom}`, `Você gosta né ${custom}`];
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`${custom} gosta!`);
      const sleepTime = 0;
      for (let i = 0; i <= 10; i++) {
        const whichOne = vm.randBetween(0, sounds.length - 1);
        setTimeout(async (when) => {
          if (vm.last_cancel < when) {
            let som = sounds[whichOne];
            console.log(`Tocando agora ${som}`)
            await vm.falar(som);
          }
        }, sleepTime, firstWhen);
      }

    },
    customBoloRandom: () => {
      var custom = vm.customtxt;
      const sounds = [custom, "cadê", "cadê o bolo", `${custom} cadê`, "o bolo", `${custom} cadê o bolo`];
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`${custom} cadê!`);
      const sleepTime = 0;
      for (let i = 0; i <= 10; i++) {
        const whichOne = vm.randBetween(0, sounds.length - 1);
        setTimeout(async (when) => {
          if (vm.last_cancel < when) {
            let som = sounds[whichOne];
            console.log(`Tocando agora ${som}`)
            await vm.falar(som);
          }
        }, sleepTime, firstWhen);
      }

    },
    customCoxinhaRandom: () => {
      var custom = vm.customtxt;
      const sounds = [custom, "cadê", "cadê a coxinha", `${custom} cadê`, "a coxinha", `${custom} cadê a coxinha`];
      const firstWhen = new Date().getTime();
      vm.showSnackBar(`${custom} cadê!`);
      const sleepTime = 0;
      for (let i = 0; i <= 10; i++) {
        const whichOne = vm.randBetween(0, sounds.length - 1);
        setTimeout(async (when) => {
          if (vm.last_cancel < when) {
            let som = sounds[whichOne];
            console.log(`Tocando agora ${som}`)
            await vm.falar(som);
          }
        }, sleepTime, firstWhen);
      }

    },
    share: (sound) => {
      const parts = [
        new Blob(['Parting file'], {
          type: 'text/plain'
        }),
        '',
        new Uint16Array([33])
      ]
      const file = new File(parts, "./audios_opus/" + sound.file, {
        lastModified: new Date(),
        type: "audio/opus"
      });
      navigator.share({
        title: sound.name,
        text: sound.name,
        url: "https://noisy-risk.github.io/",
        files: [file]
      })
    }
  }
})
