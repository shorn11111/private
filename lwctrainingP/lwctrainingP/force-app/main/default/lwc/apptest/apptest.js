import { LightningElement, track } from 'lwc';
const CLS_SPIN_LOAD = 'spinHolder';
export default class App extends LightningElement {

    @track loading = CLS_SPIN_LOAD;

   name = 'Electra X4';
   description = 'A sweet bike built for comfort.';
   category = 'Mountain';
   material = 'Steel';
   price = '$2,700';
   pictureUrl = 'https://s3-us-west-1.amazonaws.com/sfdc-demo/ebikes/electrax4.jpg';
 
   ready = false;
   connectedCallback() {
       this.loading = CLS_SPIN_LOAD;
       setTimeout(() => {
           this.ready = true;
       }, 3000);
   }
}