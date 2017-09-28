import { Component } from '@angular/core';
import { IonicPage, NavController, ViewController, ToastController, Platform, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';

import { CargaArchivoProvider } from './../../providers/carga-archivo/carga-archivo';
import { Post } from './../../models/post.interface';


@IonicPage()
@Component({
  selector: 'page-subir',
  templateUrl: 'subir.html',
})
export class SubirPage {

  titulo: string = "";
  imgPreview: string = null;
  img: string = "";

  constructor(
    public navCtrl: NavController,
    private viewCtrl: ViewController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private _carga: CargaArchivoProvider
  ) { }

  subirPost() {
    console.log('Subiendo imagen');

    let post: Post = {
      titulo: this.titulo,
      img: this.img
    }

    let loader = this.loadingCtrl.create({
      content: "Subiendo...",
    });
    loader.present();

    this._carga.cargar_imagenes_firebase(post)
      .then(() => {
        loader.dismiss();
        this.cerrarModal();
      },(error) => {
        loader.dismiss();
        this.mostrarToast('Error al cargar');
        console.error('Error al cargar: '+ JSON.stringify(error));
      });
  }

  mostrarSeleccion() {
    if (!this.platform.is('cordova')) {
      this.mostrarToast('Error: No estamos en un dispositivo movil');
      return;
    }

    let options: ImagePickerOptions = {
      maximumImagesCount: 1,
      quality: 40,
      outputType: 1
    }

    this.imagePicker.getPictures(options).then((results) => {

      for (let img of results) {
        this.imgPreview = 'data:image/jpeg;base64,' + img;
        this.img = img;
        break;
      }
    }, (err) => {
      this.mostrarToast('Error seleccion: ' + err);
      console.error('Error: ', JSON.stringify(err));
    });

  }

  mostrarCamara() {

    if (!this.platform.is('cordova')) {
      this.mostrarToast('Error: No estamos en un dispositivo movil');
      return;
    }

    const options: CameraOptions = {
      quality: 40,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.imgPreview = 'data:image/jpeg;base64,' + imageData;
      this.img = imageData;
    }, (err) => {
      // Handle error
      this.mostrarToast('Error: ' + err);
      console.error("Error en la camara: ", err);
    });
  }

  mostrarToast(text: string) {
    this.toastCtrl.create({
      message: text,
      duration: 2500,
    }).present();
  }

  cerrarModal() {
    this.viewCtrl.dismiss();
  }

}
