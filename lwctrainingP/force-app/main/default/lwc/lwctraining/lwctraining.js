import { LightningElement, track } from 'lwc';
import addAccount from '@salesforce/apex/importCSV.addAccount';
export default class ImportCSV extends LightningElement {
    /**
     * 取込データ
     */
    @track
    data = undefined;
    @track
    isImport
    
    /**
     * ファイルが選択された場合の処理
     * @param {*} event 
     */
    handleFileChanged(event) {
        // 指定されたファイルを読み込む
        const fileReader = new FileReader();
        fileReader.onloadend = (e) => {
            this.data = fileReader.result;
            this.isImport = true;
        };
        fileReader.readAsText(event.detail.files[0], 'Shift_JIS');
    }
    /**
     * 指定されたCSVファイルを取引先としてインポートする
     * @param {*} event イベント情報
     */
    handleImportClick(event) {
        // 読み込んだデータを改行で分割する
        const rows = this.data.split(/\r\n|\n/);
        // 取引先を登録する
        for(let i=0 ; i<rows.length; i++) {
            if (rows[i].length !== 0){
                const row = rows[i].replace(/\"/g, '');
                addAccount({data: row});
            }
        }
        this.data = undefined;
        this.isImport = false;
    }
}