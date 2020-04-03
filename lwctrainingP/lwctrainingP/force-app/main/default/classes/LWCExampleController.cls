public with sharing class LWCExampleController {

    // ラッパークラス
    public class objwrapper {
        @AuraEnabled public String recId;
        @AuraEnabled public String recName;
        // コンストラクタ
        public objwrapper(String argId,String argName){
            this.recId = argId;
            this.recName = argName;
        }
    }

    // 対象オブジェクトレコード取得
    @AuraEnabled
    public static List<objwrapper> getRecords2(String objName){
        String objrec ='SELECT Id,Name FROM ' + objName + ' ORDER BY Name LIMIT 100';
        System.debug(objrec);
        List<objwrapper> rude = new List<objwrapper>() ;
        // databaseを呼び出すときはsObjectリスト型にする必要がある

        List<sObject> reclist = Database.query(objrec);
        // forでsObjectの中からヒットしたレコードをobjwrapperに差し込む
        for(sObject rec : reclist){
            rude.add(new objwrapper(
                String.valueOf(rec.get('Id')),
                String.valueOf(rec.get('Name'))
            ));
        }
        return rude;
    }
    @AuraEnabled
    public static String attachFile(String tgtId, String fileTitle, String fileName, String base64Data) {
        try{
            ContentVersion conVer = new ContentVersion();
            // ファイルのタイトル名
            conVer.Title = fileTitle;
            // ファイルを決めるための絶対パス
            conVer.PathOnClient = fileName;
            // 型はbase64　
            conVer.VersionData = EncodingUtil.base64Decode(base64Data);
            insert conVer;
            
            if(String.isNotEmpty(tgtId)){

                ContentDocumentLink condoc = new ContentDocumentLink();
                // ドキュメントのID
                    condoc.ContentDocumentId = [SELECT Id,ContentDocumentId FROM ContentVersion WHERE Id = :conVer.Id].ContentDocumentId;
                    // リンクされたオブジェクトのID。APIのみを使用して、メモをカスタム設定に関連付けることができます
                    condoc.LinkedEntityId = Id.valueOf(tgtId);
                    // SharetypeのV。閲覧者の許可。ユーザーは共有ファイルを明示的に表示できますが、編集することはできません。
                    condoc.ShareType ='V';
                    // このファイルをすべてのユーザー、内部ユーザー、または共有ユーザーが使用できるかどうかを指定します
                    condoc.Visibility = 'AllUsers';
                    insert condoc;
                }
                return '';

        }catch(Exception ex){
            System.debug(String.valueOf(ex));
            return String.valueOf(ex);
        }
    }
}