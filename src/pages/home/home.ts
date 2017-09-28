import { Component } from '@angular/core';
import { NavController, ModalController, Platform, ToastController } from 'ionic-angular';
import { CargaArchivoProvider } from './../../providers/carga-archivo/carga-archivo';
import { Post } from './../../models/post.interface';

import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  displayName = '';
  authenticated: boolean = false;
  hayMas: boolean = true;

  constructor(
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    public _carga: CargaArchivoProvider,
    private afAuth: AngularFireAuth,
    private fb: Facebook,
    private platform: Platform,
    private toastCtrl: ToastController,
    private socialSharing: SocialSharing
  ) {
    this._carga.cargar_imagenes();
    afAuth.authState.subscribe(user => {
      if (!user) {
        this.authenticated = false;
        this.displayName = null;
        return;
      }
      this.authenticated = true;
      this.displayName = user.displayName;
      this.mostrarToast('Autenticado como: ' + this.displayName);
      console.log(this.displayName);
    });

  }

  login() {
    if (this.platform.is('cordova')) {
      return this.fb.login(['email', 'public_profile']).then((res: FacebookLoginResponse) => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return firebase.auth().signInWithCredential(facebookCredential);
      })
    }
    else {
      return this.afAuth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then(res => console.log(res));
    }
  }

  logout() {
    this.afAuth.auth.signOut()
      .then(() => console.log('-- Fin sesion --'));
  }

  compartir(post: Post) {
    this.socialSharing.shareViaFacebook(post.titulo, post.img).then(() => {
      this.mostrarToast('Compartida correctamente');
    }).catch((err) => {
      this.mostrarToast('Error al compartir post');
      console.log(' -- ERROR: ' + err + ' -- ');
    })
  }

  cargar_siguientes(infiniteScroll: any) {
    console.log('Siguientes...')
    this._carga.cargar_imagenes()
      .then(
      (existenMas: boolean) => {
        infiniteScroll.complete();
        console.log(existenMas);
        this.hayMas = existenMas;
      }
      )
  }

  mostrarModal() {
    let modal = this.modalCtrl.create('SubirPage');
    modal.present();
  }

  mostrarToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 2500,
    }).present();
  }
}
