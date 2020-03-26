/**
 * クラス名 : CustomFileUploaderCtrl
 * クラス概要 : ファイルアップローダーコンポーネントのコントローラクラス
 */
public with sharing class CustomFileUploaderCtrl {

    /**
     * 対象オブジェクトレコードラッパークラス
     */
    public class ObjRecordWrap {
        // publicでrecId,recNameを定義する
        @AuraEnabled public String recId;
        @AuraEnabled public String recName;
        public ObjRecordWrap(String argId, String argName) {
            this.recId = argId;
            this.recName = argName;
        }
    }

    /**
     * 対象オブジェクトレコードリスト取得
     * param {objName} 対象オブジェクトAPI
     * return {List<ObjRecordWrap>} 対象レコードリスト
     */
    @AuraEnabled
    public static List<ObjRecordWrap> getRecords(String objName) {
        // オブジェクトAPIからNameとIdのデータを取り出してくる
        String sQuery = 'SELECT Id, Name FROM ' + objName + ' ORDER BY Name LIMIT 100';
        // リストのインスタンス生成(ObjRecodWrapのデータに入れるため)
        List<ObjRecordWrap> objRecWrapList = new List<ObjRecordWrap>();
        
        List<sObject> recList = Database.query(sQuery);
        for(sObject rec : recList) {
            objRecWrapList.add(new ObjRecordWrap(
                String.valueOf(rec.get('Id')),
                String.valueOf(rec.get('Name'))
            ));
        }
        return objRecWrapList;
    }

    /**
     * ファイル添付処理
     * param {tgtId} 対象レコードID
     * param {fileTitle} タイトル
     * param {fileName} ファイル(拡張子有)
     * param {base64Data} ファイルデータ(Base64形式)
     * return {String} 処理結果
     */
    @AuraEnabled
    public static String attachFile(String tgtId, String fileTitle, String fileName, String base64Data) {
        try{
            ContentVersion conVer = new ContentVersion();
            conVer.Title = fileTitle;
            conVer.PathOnClient = fileName;
            conVer.VersionData = EncodingUtil.base64Decode(base64Data);
            insert conVer;

            if(String.isNotEmpty(tgtId)){
                ContentDocumentLink condLink = new ContentDocumentLink();
                condLink.ContentDocumentId = [SELECT Id, ContentDocumentId FROM ContentVersion 
                                              WHERE Id = :conVer.Id].ContentDocumentId;
                condLink.LinkedEntityId = Id.valueOf(tgtId);
                condLink.ShareType = 'V';
                condLink.Visibility = 'AllUsers';
                insert condLink;
            }
            return '';
        }catch(Exception ex){
            System.debug(String.valueOf(ex));
            return String.valueOf(ex);
        }
    }
}