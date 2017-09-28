import { AngularFireDatabase } from 'angularfire2/database';
import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';

import { Post } from '../../models/post.interface';
import * as firebase from 'firebase';

@Injectable()
export class CargaArchivoProvider {

  private CARPETA_IMAGENES: string = 'img';
  private POSTS: string = 'posts';

  imagenes: any[] = [];
  lastKey: string = undefined;

  constructor(
    private toastCtrl: ToastController,
    private afDB: AngularFireDatabase
  ) {

  }
  cargar_imagenes() {
    return new Promise ( (resolve, reject) => {
      this.afDB.list('/posts', {
        query: {
          limitToLast: 4,
          orderByKey: true,
          endAt: this.lastKey
        }
      }).subscribe ( posts => {
        if (this.lastKey){
          posts.pop();
        }

        if (posts.length == 0){
          console.log('Yo no existen mas POSTS');
          resolve(false);
          return;
        }
        
        this.lastKey = posts[0].$key;

        for (let i = posts.length-1; i>=0; i--) {
          let post = posts[i];
          this.imagenes.push(post);
        }
        resolve(true);
      })
    })
  }

  cargar_imagenes_firebase(archivo: Post) {
    let promesa = new Promise((resolve, reject) => {
      this.mostrar_toast('Inicio de carga');

      let storageRef = firebase.storage().ref();
      let nombreArchivo = new Date().valueOf();

      let uploadTask: firebase.storage.UploadTask =
        storageRef.child(`${this.CARPETA_IMAGENES}/${nombreArchivo}`)
          .putString(archivo.img, 'base64', { contentType: 'image/jpeg' });

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        ( snapshot ) => {},
        ( error ) =>  {
          console.error('Error al subir '+ JSON.stringify(error));
          this.mostrar_toast('Error al cargar');
          reject(error);
        },
        () => {
          let url = uploadTask.snapshot.downloadURL;
          this.mostrar_toast('Carga correcta!');
          this.crear_post(archivo.titulo, url);
          resolve();
        } 
      )
    });
    return promesa;
  }

  private crear_post( titulo: string, url: string ) {
    let post: Post = {
      img: url,
      titulo: titulo
    }

    let key = this.afDB.database.ref(`${this.POSTS}`).push(post).key;
    post.$key = key;

    this.imagenes.unshift(post);
  }

  private mostrar_toast(text: string) {
    this.toastCtrl.create({
      duration: 2500,
      message: text
    }).present();
  }

}
