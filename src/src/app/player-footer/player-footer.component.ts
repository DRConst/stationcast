import { Component, OnInit } from '@angular/core';
import { Howl, Howler } from 'howler';
import { PlayerService } from "../player.service";
import { Podcast } from '../podcast';
import { Episode } from '../episode';
import * as SiriWave from '../siriWave.js'
import * as $ from 'jquery';

function formatTime(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

@Component({
    selector: 'app-player-footer',
    templateUrl: './player-footer.component.html',
    styleUrls: ['./player-footer.component.css']
})

export class PlayerFooterComponent implements OnInit {

    sound: any;
    elems: any;
    message: string;
    soundID: any;
    seekBackup: any;

    hasSeeken: any;

    wave: any;

    currentPodcast: Podcast;
    currentEpisode: Episode;

    constructor(private playerService: PlayerService) { }

    togglePlaylist() {
        if (window['playlist'].style.display == "block") {
            window['playlist'].style.display = "none";
        }
        else {
            window['playlist'].style.display = "block";
        }
    }

    toggleVolume() {
        if (window['slidecontainer'].style.display == "block") {
            window['slidecontainer'].style.display = "none";
        }
        else {
            window['slidecontainer'].style.display = "block";
        }
    }

    saveProgressCallback(thisRef) {
        if (thisRef.sound && thisRef.hasSeeken) {

            $.ajax({
                url: "https://audioback.diogoconstancio.com/updatePosition",
                type: "POST",
                data: "{\"name\" : \"" + thisRef.currentPodcast.name + '|' + thisRef.currentEpisode.name + "\", \"elapsed\" : " + thisRef.sound.seek() + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });

            thisRef.currentEpisode.elapsed = thisRef.sound.seek();

            //if we're 1 minute from the end, mark as completed
            if (thisRef.currentEpisode.elapsed + 60 > thisRef.currentEpisode.length)
                thisRef.currentEpisode.completed = true;
        }
    }

    loadEpisode() {
        var message = this.currentPodcast.name + '|' + this.currentEpisode.name;

        message = message.replace(/[^a-z0-9/-\|-]/gi, '_');


        var setDuration = function(str) {
            window['duration'].innerHTML = str;
        }

        var seekForward = function(sound, thisRef) {
            if (!thisRef.currentEpisode.elapsed)
                thisRef.currentEpisode.elapsed = 0;

            thisRef.sound = sound;
            sound.seek(thisRef.currentEpisode.elapsed);
        }

        var resetProgress = function(sound, resume) {
            window['progress'].style.animation = 'none';
            setTimeout(function() {
                window['progress'].style.animation = '';
                window['progress'].style['animation-timing-function'] = 'linear';
                window['progress'].style['animation-delay'] = (-thisRef.currentEpisode.elapsed ? -thisRef.currentEpisode.elapsed : 0) + 's';
                window['progress'].style['animation-duration'] = sound.duration() + 's';
                if (resume) {
                    window['progress'].style['animation-play-state'] = 'running';
                }
                else {
                    window['progress'].style['animation-play-state'] = 'paused';
                }
            }, 10);
        }

        var saveProgressCallback = this.saveProgressCallback;
        var thisRef = this;

        this.sound = new Howl({
            src: ["https://audioback.diogoconstancio.com/episodeAudio?name=" + encodeURI(message)],
            autoplay: true,
            loop: false,
            preload: true,
            html5: true,
            volume: 1.0,
            onload: function() {
                setDuration(formatTime(Math.round(this.duration())));
                seekForward(this, thisRef);
                thisRef.hasSeeken = true;
                resetProgress(this, true);
                //this.play();
            },
            onplay: function() {
                thisRef.wave.start();
            },
            onpause: function(id) {
                if (thisRef.hasSeeken) {
                    saveProgressCallback(thisRef);
                    resetProgress(this, false);
                    thisRef.wave.stop();
                }
            },
            onseek: function() {
                if (thisRef.hasSeeken) {
                    var seek = this.seek() || 0;
                    thisRef.currentEpisode.elapsed = thisRef.sound.seek();
                    resetProgress(this, true);
                }
            },
            onend: function() {
                thisRef.playerService.endEpisode.next(0);
                thisRef.wave.stop();
            }
        });
    }

    onPlay() {

        //if sound already exists, do not reload
        if (this.soundID) {
            this.sound.play(this.soundID);
        } else {
            this.soundID = this.sound.play();
        }

        window['playBtn'].style.display = 'none';
        window['pauseBtn'].style.display = 'inline-block';
        window['track'].innerHTML = this.currentEpisode.name;
    }

    onPause() {
        this.seekBackup = this.sound._sounds[0]._seek;
        this.sound.pause(this.soundID);
        window['playBtn'].style.display = 'inline-block';
        window['pauseBtn'].style.display = 'none';
    }

    onPrev() {
        this.playerService.prevEpisode.next(0);
    }

    onNext() {
        this.playerService.nextEpisode.next(0);
    }

    ngOnInit() {
        this.hasSeeken = false;

        this.playerService.currentPodcast.subscribe(podcast => this.currentPodcast = podcast)
        this.playerService.currentEpisode.subscribe(episode => {
            if (episode && episode.name != undefined) {
                this.currentEpisode = episode;
                //if sound exits, clean it
                if (this.sound) {
                    this.sound.unload();
                    this.sound = undefined;
                    this.soundID = 0;
                }
                this.loadEpisode();
                this.onPlay();
            }
        })

        this.playerService.resetEpisodeRef.subscribe(episode => {

            if (this.currentEpisode && this.currentEpisode.name == episode.name) {
                this.sound.seek(0);
            }
        })

        this.elems = ['footer', 'track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'progress', 'progressAnim', 'bar', 'wave', 'loading', 'playlist', 'list', 'volume', 'barEmpty', 'barFull', 'sliderBtn', 'slidecontainer', 'volumeRange'];
        this.elems.forEach(function(elm) {
            window[elm] = document.getElementById(elm);
        });
        var thisRef = this;

        this.wave = new SiriWave({
            container: window['waveform'],
            width: window.innerWidth,
            height: window.innerHeight * 0.3,
            cover: true,
            speed: 0.03,
            amplitude: 0.7,
            frequency: 2
        });

        window['hiddenSeekBar'].addEventListener('click', function(event) {
            var posInfo = window['hiddenSeekBar'].getBoundingClientRect();
            thisRef.sound.seek(thisRef.sound.duration() * (event.clientX - posInfo.left) / window['hiddenSeekBar'].offsetWidth);
        });

        Howler.mobileAutoEnable = false;
        // Change global volume.
        Howler.volume(1.0);

        window.setInterval(function() {
            if (thisRef.sound && thisRef.sound.playing()) {
                window['timer'].innerHTML = formatTime(Math.round(thisRef.sound.seek()));
            }
        }, 1000);

        var loop = window.setInterval(function() {
            thisRef.saveProgressCallback(thisRef);
        }, 30000);

        $(window).on('unload', function(event) {
            thisRef.saveProgressCallback(thisRef);
        });

        if(localStorage.volume)
        {
            Howler.volume(localStorage.volume);
            window['volumeRange'].value = "" + localStorage.volume;
        }
        window['volumeRange'].oninput = function() {
            Howler.volume((this.value) / 100.0);
            localStorage.volume = (this.value) / 100.0;
        }
    }

}
