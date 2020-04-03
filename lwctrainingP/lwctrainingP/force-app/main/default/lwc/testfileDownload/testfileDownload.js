import { LightningElement } from 'lwc';

let downloadElement = document.createElement('a');
downloadElement.href = 'https://www.w3schools.com/images/myw3schoolsimage.jpg';
downloadElement.setAttribute("download","download");
downloadElement.download = 'download.jpg';
downloadElement.click(); 
export default class TestfileDownload extends LightningElement {
}