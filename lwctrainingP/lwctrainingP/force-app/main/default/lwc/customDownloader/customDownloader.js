import { LightningElement,track} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getArtistRecodes from '@salesforce/apex/CustomDownloader.getArtistRecodes';
import downloadFile from '@salesforce/apex/CustomDownloader.downloadFile';
// import downloadFileName from '@salesforce/apex/CustomDownloader.downloadFileName';

const CLS_ICON_NAME ='doctype:attachment';
const CLS_SPIN_SHOW ='spinHolder';
const CLS_SPIN_HIDE='slds-hide spinHolder';
const OBJ_NAME_SELECT ='Artist__c';
const TEXT_COLOR = 'error';

const MSG_SUC_BANAR = 'ダウンロードに成功しました';
const MSG_ERR_BANAR ='ダウンロードに失敗しました';
const MSG_INI_BANAR = '初期処理に失敗しました';

export default class CustomDownloader extends LightningElement {
    @track fileList =　false;
    @track isDisabled = true;
    @track isClear = false;
    @track isExist = true;
    @track doSpin = false;
    @track download = false;
    @track ListValue ='';
    @track loading = CLS_SPIN_HIDE;
    @track iconName = CLS_ICON_NAME;
    @track error = '';
    @track recCount ='';
    @track artistDataRec = [];
    @track fileBefore = [];
    @track fileAfter = [];
    @track selectedFile = [];
    @track artistRec= '';
    @track openmodel = false;
    fileIds = '';
    fileName = '';
    objArtist = OBJ_NAME_SELECT;
    dataArray = [];

    /**
     * 初期処理
     */
    connectedCallback(){
        this.recodelist();
    }
    /**
     * recodelistメソッド追加　3/26　内田
     */
    recodelist(){
        getArtistRecodes({
            objName: this.objArtist
        })
        .then(result => {
            this.dataArray =result;
            var listStart =[{label: '- なし -',value:''}];
            this.dataArray.forEach(element =>{
                var option ={
                    label: element.recName,
                    value: element.recId
                };
                listStart.push(option);
            });
            this.artistDataRec =listStart;
            console.log(JSON.stringify(this.artistDataRec));
        })
        .catch(error =>{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MSG_INI_BANAR,
                    variant: 'error'
                })
            )
            console.log(MSG_INI_BANAR +',' +JSON.stringify(error))
        });
    }

    /**
     * 選択リストから何かを選んだとき
     * @param event{event} イベント選択リスト選択時
     */
    handleArtistSelectRec(event){
        console.log('レコード選択リスト選択時　selectedFile :' + this.selectedFile);
        console.log('選択ID:'+this.fileList +','+'AirtistRec :' + this.artistRec);
        
        this.artistRec = event.detail.value;
        
        // 選択リストでなしを選んだとき
        if(this.fileList ==true && this.artistRec == ''){
            this.fileList = false;
            this.download = false;
            this.artistRec = '';
            this.fileBefore ='';
            this.selectedFile='';
            return;
        }else if(this.selectedFile.length > 0){
            console.log('☆if内　selectedFile :' + this.selectedFile);
            this.download = false;
            this.fileBefore ='';
            this.selectedFile = '';
            console.log('☆if内2　selectedFile :' + this.selectedFile);
        }else{
            this.doSpin = !this.doSpin;
            this.loading = CLS_SPIN_SHOW;
            this.download = false;
            this.fileList = true;
            console.log('選択ID:'+this.fileList +','+this.artistRec);
        }
        
        downloadFile({
            recodeId: this.artistRec,
            recodeName: this.fileName
        })
        .then(result => {
            let fileDataList = result;
            let resultA =[];
            fileDataList.forEach(resultId =>{
                resultA.push({
                    label : resultId.FullName,
                    value : resultId.FullData
                });
            });
            console.log('resultA：'+ JSON.stringify(resultA));
            this.fileBefore = resultA;
            this.doSpin =false;
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MSG_ERR_BANAR,
                    variant: 'error'
                })
            )
            console.log('catch内　error : ' + MSG_ERR_BANAR + ',' + JSON.stringify(error));
        });
    }

    /**
     * リスト表示
     */
    get options(){
        return this.fileBefore;
    }

    //  モーダル封印
    // openmodal(){
    //     this.openmodel =  true;
    // }
    // closeModal(){
    //     this.openmodel =  false;
    // }

    /**
     *  キャンセルボタン処理
     */
    doclear(){
        this.isDisabled = true;
        this.download = false;
        this.fileList = false;
        this.artistRec = '';
        this.fileBefore = '';
        console.log('キャンセル　selectedFile :' + this.selectedFile + 'resultA：'+ JSON.stringify(resultA));
        this.selectedFile = '';
    }
    /**
     * 保存ボタン押したときの処理
     */
    doSave(){
        this.doSpin = !this.doSpin;
        this.loading = CLS_SPIN_SHOW;
        this.dispatchEvent(
            new ShowToastEvent({
                title: MSG_SUC_BANAR,
                variant: 'success'
            })
            );
        this.doSpin = false;
        // this.closeModal();
    }

    //  リスト追加や削除などの選択時の処理
    handleChange(e){
        this.selectedFile = e.detail.value;
        if(this.selectedFile.length > 0){
            // this.isDisabled = false;
            this.download = true;
        }else{
            // this.isDisabled = true;
            this.download = false;
        }
        console.log('handleCange 選択されたファイル：' + this.selectedFile + ',' + 'fileAfter' + JSON.stringify(this.fileAfter));
    }
    
    // 保存する前の処理
    get getDownloadLink(){
        this.doSpin = !this.doSpin;
        this.loading = CLS_SPIN_SHOW;
        this.recCount = this.selectedFile.length;
        console.log('recCount :' + this.recCount);

        let selectedOwner = '';
        // ファイルごとに「 / 」を入れる
        for (let i in this.selectedFile) {
            selectedOwner += this.selectedFile[i]+'/';
        }
        // 最後の /　だけ　?　に置き換える
        selectedOwner =selectedOwner.replace(/.$/,"?");
        console.log('保存前のファイル状態：' + selectedOwner);
        this.doSpin = false;
        // ファイルIDをリンクに合体させ、zipファイルでまとめてダウンロード
        return '/sfc/servlet.shepherd/version/download/'+ selectedOwner;
    }
}
