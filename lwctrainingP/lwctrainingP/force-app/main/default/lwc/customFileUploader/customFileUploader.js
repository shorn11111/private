import { LightningElement,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRecords2 from '@salesforce/apex/LWCExampleController.getRecords2';
import attachFile from '@salesforce/apex/LWCExampleController.attachFile';

// 定数
const CLS_DLG_TRUE = 'slds-file-selector__dropzone slds-has-drag-over';
const CLS_DLG_FALSE ='slds-file-selector__dropzone';

const CLS_ICON_NAME ='doctype:attachment';
const CLS_CLR_TRUE ='slds-m-right_xx-small';
const CLS_CLR_FALSE ='slds-hide';
const CLS_SPIN_SHOW ='spinHolder';
const CLS_SPIN_HIDE='slds-hide spinHolder';
const OBJ_NAME_SELECT ='Artist__c';

const MSG_FLE_UPL ='ファイルアップロード';
const MSG_FLE_SAB ='ファイルをドラッグ・ドロップして下さい';
const MSG_ERR_SIZE ='ファイルの読み込みに失敗しました';
const MSG_SIZE_OVER ='ファイルが3MBを超えています';
const MSG_FLE_NON ='選択されたファイルは無効です';
const MSG_FST_ERR = '初期処理に失敗しました';
const MSG_CREATE_SUCCESS = 'ファイルをアップロードしました';
const MSG_CREATE_ERROR = 'アップロードに失敗しました';
const REG_EXP_DEF = /(.*)(?:\.([^.]+$))/;
const FLE_SIZE_MAX = 3000000;

export default class CustomFileUploader extends LightningElement{

    @track isDisabled = true;
    @track isExist = false;
    @track isDrag = false;
    @track selectRec2 ='';
    @track btnLabel = MSG_FLE_UPL;
    @track txtLabel = MSG_FLE_SAB;
    @track loading = CLS_SPIN_HIDE;
    @track iconName = CLS_ICON_NAME;
    @track fileName ='';
    @track dataRec2= [];
    objArtist = OBJ_NAME_SELECT;
    dataArray =[];
    inputFile = '';

    get clsdrag(){
        return this.isDrag ? CLS_DLG_TRUE : CLS_DLG_FALSE;
    }

    get clsClearBtn2(){
        return this.isExist ? CLS_CLR_TRUE : CLS_CLR_FALSE;
    }
    // 初期処理
    connectedCallback(){
        getRecords2({
            objName: this.objArtist
        })
        .then(result => {
            this.dataArray = result;
            let listfirst =[{label:'- なし -',value :''}];

            this.dataArray.forEach(element =>{
                var optioning ={
                    label:element.recName,
                    value:element.recId
                };
                listfirst.push(optioning);
            });
            this.dataRec2= listfirst;
            console.log(JSON.stringify(this.dataRec2));
        })
        .catch(error => {
            this.dispBanner(MSG_FST_ERR,'error');
            console.log(MSG_FST_ERR +','+JSON.stringify(error));
        });
        
    }
    //         get options(){
    //             return this.dataRec2;
    //         }

    doImport(fInput){
        if(!fInput){
            this.dispBanner(MSG_FLE_NON,'error');
            this.doClear();
            return;
        }
        if(fInput.size > FLE_SIZE_MAX){
            this.dispBanner(MSG_SIZE_OVER,'error');
            this.doClear();
            return;
        }
        const fName = fInput.name;
        const fexec = (/[.]/.exec(fName)) ? fName.match(REG_EXP_DEF)[2] : undefined;
        this.iconName = this.getIcon(fexec);
        this.fileName =fName;
        this.loading =CLS_SPIN_SHOW;
        
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
            this.dispBanner(MSG_ERR_SIZE, 'error');
            this.doClear();
        }
    }

    doSave(){
        if(!this.inputFile) return;
        // アップロードボタン押下後
        this.loading = CLS_SPIN_SHOW;
        this.isDisabled =true;

        attachFile({
            tgtId: this.selectRec2,
            fileTitle:this.fileName.match(REG_EXP_DEF)[1],
            fileName: this.fileName,
            base64Data: this.inputFile
        })
        .then(result =>{
            if(!result){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: MSG_CREATE_SUCCESS,
                        variant: 'success'
                    })
                );
            }else{
                this.dispBanner(MSG_CREATE_ERROR,'error');
                console.log(result);
            }
            this.loading = CLS_SPIN_HIDE;
        })
        .catch(error =>{
            this.dispBanner(MSG_CREATE_ERROR,'error');
            this.loading =CLS_SPIN_HIDE;
            console.log(MSG_CREATE_ERROR + ',' + JSON.stringify(error));
        });
    }
    /**
     * 選択リスト変更処理
     * param {event} イベント
     */
    handleSelectRec2(event) {
        this.selectRec2 = event.detail.value;
        console.log('選択ID:' + this.selectRec2);
    }
    dispBanner(argMsg, argType) {
        this.template.querySelector('c-custom-banner').doOpen(argMsg, argType);
    }

    doClear(){
        this.fileName ='';
        this.inputFile='';
        this.isDisabled = true;
        this.isExist = false;
    }

    getIcon(fexec){
        switch(fexec.toLowerCase()){
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

    ondrop(event){
        // 現在のイベントのさらなる伝播 (propagation) を止めます。
        event.event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect ='copy';
        this.isDrag =false;
        const fInput =event.dataTransfer.files[0];
        this.doImport(fInput);
    }
    // ドラッグ開始時
    ondrag(event){
        event.preventDefault();
        this.isDrag =true;
    }

    onleave(){
        this.isDrag =false;
    }
    onDataImport(event){
        const fInput = event.target.files[0];
        if(fInput) this.doImport(fInput);
    }
}











