public with sharing class CustomDownloader {

    // ラッパークラス Objwrapper
    public class Objwrapper {
        @AuraEnabled public String recId;
        @AuraEnabled public String recName;
        // コンストラクタ
        public Objwrapper(String argId,String argName){
            this.recId = argId;
            this.recName = argName;
        }
    }
    // ラッパークラス ObjFileWrapper
    public class ObjFileWrapper{
        @AuraEnabled public String FullData;
        @AuraEnabled public String FullName;
        public ObjFileWrapper(String fileData,String fileName){
            this.FullData = fileData;
            this.FullName = fileName;
        }
    }
    
    // 対象オブジェクトレコード取得
    @AuraEnabled
    public static List<Objwrapper> getArtistRecodes(String objName){
        String objrec ='SELECT Id,Name FROM ' + objName + ' ORDER BY Name LIMIT 100';
        System.debug(objrec);
        List<Objwrapper> rude = new List<Objwrapper>() ;
        
        // databaseを呼び出すときはsObjectリスト型にする必要がある
        List<sObject> reclist = Database.query(objrec);
        // forでsObjectの中からヒットしたレコードをobjwrapperに差し込む
        for(sObject rec : reclist){
            rude.add(new Objwrapper(
                String.valueOf(rec.get('Id')),
                String.valueOf(rec.get('Name'))
            ));
        }
        return rude;
    }


    @AuraEnabled
    public static List<ObjFileWrapper> downloadFile(String recodeId,String recodeName){
        System.debug('レコードID:'+ recodeId);
        Set<Id> contentDocumentIds = new Set<Id>();
        List<ObjFileWrapper> contentVersionIds = new List<ObjFileWrapper>();
        // レコードIDが空っぽじゃないとき
        if(String.isNotBlank(recodeId)) {
            // レコードIDでドキュメントを検索
            for(ContentDocumentLink cdl : [SELECT ContentDocumentId,LinkedEntityId,ContentDocument.FileType FROM ContentDocumentLink WHERE LinkedEntityId =:recodeId]) {
                contentDocumentIds.add(cdl.ContentDocumentId);
            }
            System.debug('contentDocumentIds :' +contentDocumentIds);
        }
        // レコードに含まれるファイルの数が0より多いとき
        if(contentDocumentIds.size() > 0) {
            Integer fileCount = contentDocumentIds.size();
            System.debug('fileCount :' +fileCount);
            
            /**
             * isLatest =trueで最新のファイルを獲得
             * contentDocumentIDでヒットしたレコード内のファイルを絞る
             */ 
            for(ContentVersion cdv : [SELECT Id,Title,PathOnClient,VersionData FROM ContentVersion WHERE isLatest = true AND ContentDocumentId IN :contentDocumentIds]) {
                contentVersionIds.add(new ObjFileWrapper(
                    cdv.Id,
                    cdv.PathOnClient
                ));
            }
            System.debug('contentVersionIds :' +contentVersionIds );
        }
        System.debug('ID: '+contentVersionIds);
        return contentVersionIds;
    }

}
