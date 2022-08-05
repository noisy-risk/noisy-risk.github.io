var vm = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
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
    pesquisa: "",
    audios: [],
    last_cancel: new Date(),
    sections: SoundData,
    snackbar: {
      visible: false,
      timeout: 2000
    }
  },
  methods: {
    play: (sound, log = true) => {
      const path = sound.file;
      var audio = new Audio("./audios/" + path);
      var xhr = new XMLHttpRequest();
      vm.audios.push(audio);
      audio.play();
      if (log) {
        console.log('logging ' + sound.name)
        xhr.open("POST", 'http://risco13-sp01:8128');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({ value: sound.name }));
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
        const whenstr = when.getHours().toString().padStart(2,'0') + ":" + when.getMinutes().toString().padStart(2,'0') + ":" + when.getSeconds().toString().padStart(2,'0')
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
      const dorimes = ["dorime.mp3", "dorime-eletro.mp3", "dorime-funk.mp3"];
      vm.playRandomFiles("DORIME RANDOM ", dorimes);
    },
    japanTapuiu: () => {
      const tapuius = ["bahia-radio-globo.mp3", "shamisen.mp3", "whatsapp-audio-2020-01-01-at-01_ehgBR2P.mp3"];
      vm.playRandomFiles("SHAMISEN ", tapuius);
    },
    falar: () => {
      var texto = vm.tts;
      var synth = window.speechSynthesis;
      var utterThis = new SpeechSynthesisUtterance(texto);
      synth.speak(utterThis);
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
        "file": "sanduiche-iche.mp3"
      });
      vm.play({
        "name": "SANDYUITI",
        "file": "sandiuiche.mp3"
      });
    }
  }
})
