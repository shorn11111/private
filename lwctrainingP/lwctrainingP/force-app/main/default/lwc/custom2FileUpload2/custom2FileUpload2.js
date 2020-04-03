import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import attachFile from '@salesforce/apex/CustomFileUploaderCtrl.attachFile';
import getRecords from '@salesforce/apex/CustomFileUploaderCtrl.getRecords';
/* 定数 */
// ドラック&ドロップのフォントデザインを定数に格納
const CLS_DRAG_TRUE = 'slds-file-selector__dropzone slds-has-drag-over';

const CLS_DRAG_FALS = 'slds-file-selector__dropzone';
const CLS_CLR_TRUE = 'slds-m-right_xx-small';
const CLS_CLR_FALS = 'slds-hide';
const CLS_SPIN_HIDE = 'slds-hide spinHolder';
const CLS_SPIN_SHOW = 'spinHolder';
const ICO_NAME_DEF = 'doctype:attachment';
const OBJ_TGT_NAME = 'PurchaseItem__c';
const MSG_BTN_LABEL = 'ファイルアップロード';
const MSG_TXT_LABEL = 'ファイルをドラッグ・ドロップしてください';
const MSG_ERR_EXIST = '選択されたファイルは無効です';
const MSG_ERR_SIZE = 'ファイルサイズが3MBを超えています';
const MSG_ERR_LOAD = 'ファイルの読込に失敗しました';
const MSG_CREATE_SUCCESS = 'ファイルをアップロードしました';
const MSG_CREATE_ERROR = 'アップロードに失敗しました';
const MSG_INIT_ERROR = '初期処理に失敗しました';
// ファイルを分割するためのコードを定数に格納
const REG_EXP_DEF = /(.*)(?:\.([^.]+$))/;
// ファイルのサイズを3MB(300万)で縛る
const FLE_SIZE_MAX = 3000000;

export default class CustomFileUploader extends LightningElement {
    // アップロードボタンを押された状態
    @track isDisabled = true;

    @track isExist = false;
    @track isDrag = false;
    @track btnLabel = MSG_BTN_LABEL;
    @track txtLabel = MSG_TXT_LABEL;
    @track loading = CLS_SPIN_HIDE;
    @track iconName = ICO_NAME_DEF;
    @track fileName = '';
    @track dataRec = [];
    @track selectRec = '';
    tgtObjName = OBJ_TGT_NAME;
    isInitialized = false;
    dataArray = [];
    inputFile = '';

    // ファイル画ドラックされているかでアップロードのデザイン表示
    get clsDrag() {
        return this.isDrag ? CLS_DRAG_TRUE : CLS_DRAG_FALS;
    }
    // クリアボタンを見せるか見せないか
    get clsClearBtn() {
        return this.isExist ? CLS_CLR_TRUE : CLS_CLR_FALS;
    }

    /**
     * 初期処理
     */
    connectedCallback() {
        if(this.isInitialized) return;
        this.isInitialized = true;
        // 選択リスト構築(ここでオブジェクトを呼び出す)
        getRecords({
            objName: this.tgtObjName
        })
        .then(result => {
            // 結果を保持
            this.dataArray = result;

            // tmpArrayに初期ラベル名と配列を追加、変数はなしの状態
            let tmpArray = [{label:'- なし -',value:''}];

            // forEach文で配列の繰り返し
            // レコードのデータを繰り返し取得する
            this.dataArray.forEach(element => {

                // optionという変数にラベル：レコード名と変数：レコードIDを代入
                var option = {
                    label: element.recName,
                    value: element.recId
                };

                // 選択リストに追加(データの数だけ)
                tmpArray.push(option);
            });

            // datarecに配列データを受け渡す
            this.dataRec = tmpArray;
        })
        // 処理中にエラーが出た場合
        .catch(error => {
            // メッセージバナー表示(初期処理に失敗しましたエラー)
            this.dispBanner(MSG_INIT_ERROR, 'error');
            console.log(MSG_INIT_ERROR + ',' + JSON.stringify(error));
        });
    }

    /**
     * ファイル選択処理
     * param {fInput} ファイル本体
     */
    doImport(fInput) {
        // もしファイルじゃないものを入れたらエラー
        if(!fInput){
            this.dispBanner(MSG_ERR_EXIST, 'error');
            // クリア処理実行可
            this.doClear();
            return;
        }
        // ファイルサイズが3MBより大きい場合エラー
        if(fInput.size > FLE_SIZE_MAX){
            console.log('ファイルサイズ：' + fInput.size);
            this.dispBanner(MSG_ERR_SIZE, 'error');
            this.doClear();
            return;
        }
        // それ以外
        // ファイル名
        const fName = fInput.name;
        // ファイルがあるとき、ファイルのタイプ型を指定
        const fileExt = (/[.]/.exec(fName)) ? fName.match(REG_EXP_DEF)[2] : undefined;
        // getIconメソッドからアイコン名呼び出して代入
        this.iconName = this.getIcon(fileExt);
        this.fileName = fName;
        this.loading = CLS_SPIN_SHOW;

        try{
            // FileReader()とは：PC内にあるファイルやバッファ上の生データに対して、読み取りアクセスを行えるオブジェクトです。
            // ファイルのアップロード時読み取り処理
            let reader = new FileReader();
            // onloadで読み込みされたときに処理
            reader.onload = (res => {
                let data = res.target.result;
                // 文字列エンコード
                let base64String = window.btoa(data);
                this.inputFile = base64String;
                // スピンホルダー表示
                this.loading = CLS_SPIN_HIDE;
                // クリアボタン表示
                this.isExist = true;
                // アップロードボタンを押されてない状態に表示
                this.isDisabled = false;
                // バナーを非表示・閉じる
                this.template.querySelector('c-custom-banner').doClose();
            });
            // FilereaderのメソッドreadAsBinaryString
            // 読み取ったデータをバイナリ文字列に変換
            reader.readAsBinaryString(fInput);
        }catch(e){
            console.log('ERROR:' + JSON.stringify(e));
            // ファイルの読み込みエラー時
            this.loading = CLS_SPIN_HIDE;
            this.dispBanner(MSG_ERR_LOAD, 'error');
            this.doClear();
        }
    }

    /**
     * 保存処理（アップロードボタンを押したとき）
     */
    doSave() {
        // もしデータがなければスルー
        if(!this.inputFile) return;

        // ボタン押下後と同時にスピン回転
        this.loading = CLS_SPIN_SHOW;

        // アップロードボタンを押下状態にして押せなくする
        this.isDisabled = true;
        // attacFileをApexにインポートするために各値代入
        attachFile({
            tgtId: this.selectRec,
            fileTitle: this.fileName.match(REG_EXP_DEF)[1],
            fileName: this.fileName,
            base64Data: this.inputFile
        })
        .then(result => {
            if(!result){
                // ディスパッチされる Event オブジェクト
                this.dispatchEvent(
                    // トーストメッセージ
                    new ShowToastEvent({
                        title: MSG_CREATE_SUCCESS,
                        variant: 'success'
                    })
                );
            }else{
                this.dispBanner(MSG_CREATE_ERROR, 'error');
                console.log(result);
            }
            // 読み込んだらスピンを隠す
            this.loading = CLS_SPIN_HIDE;
        })
        .catch(error => {
            this.dispBanner(MSG_CREATE_ERROR, 'error');
            this.loading = CLS_SPIN_HIDE;
            console.log(MSG_CREATE_ERROR + ',' + JSON.stringify(error));
        });
    }

    /**
     * クリア処理
     */
    doClear() {
        this.inputFile = '';
        this.fileName = '';
        this.isDisabled = true;
        this.isExist = false;
    }

    /**
     * 選択リスト変更処理
     * param {event} イベント
     */
    handleSelectRec(event) {
        this.selectRec = event.detail.value;
        console.log('選択ID:' + this.selectRec);
    }

    /**
     * メッセージバナー表示
     * param {argMsg} メッセージ本文
     * param {argType} メッセージタイプ
     */
    dispBanner(argMsg, argType) {
        this.template.querySelector('c-custom-banner').doOpen(argMsg, argType);
    }

    /**
     * アイコン取得
     * param  {fileExt} ファイル拡張子
     * return {String} アイコン
     */
    getIcon(fileExt) {
        // toLowerCase文で大文字のアルファベットを小文字に変換
        switch(fileExt.toLowerCase()){
            // アップロードされた名前ごとにswich文で条件分岐、アイコン画像付加する
            case 'jpg':
            case 'png':
            case 'gif':
            case 'jpeg':
                return 'doctype:image';
            case 'csv':
                return 'doctype:csv';
            case 'txt':
                return 'doctype:txt';
            case 'pdf':
                return 'doctype:pdf';
            case 'zip':
                return 'doctype:zip';
            case 'xlsx':
            case 'xlsm':
                return 'doctype:excel';
            case 'xml':
                return 'doctype:xml';
            case 'ppt':
            case 'pptx':
                return 'doctype:ppt';
            case 'doc':
            case 'docx':
                return 'doctype:word';
            default:
                return 'doctype:attachment';
        }
    }

    /**
     * ドロップ処理
     * param {event} イベント
     */
    onDataDrop(event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        this.isDrag = false;
        const fInput = event.dataTransfer.files[0];
        this.doImport(fInput);
    }

    /**
     * ドラッグ開始処理
     * param {event} イベント
     */
    onDrag(event) {
        event.preventDefault();
        this.isDrag = true;
    }

    /**
     * ドラッグ終了処理
     */
    onDend() {
        this.isDrag = false;
    }

    /**
     * ファイル選択処理
     * param {event} イベント
     */
    onDataImport(event) {
        const fInput = event.target.files[0];
        if(fInput) this.doImport(fInput);
    }
}