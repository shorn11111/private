public with sharing class businessBoard {

    public class ObjectBoardWrap {
        @AuraEnabled public String BoardId;
        @AuraEnabled public String BoardName;
        @AuraEnabled public String BoardMoney;
        @AuraEnabled public Date BoardDelivery;
        @AuraEnabled public Date BoardDate;

        //コンストラクタ設置
        public ObjectBoardWrap(String BId,String BName,String BMoney,Date BDelivery,Date BDate){
            this.BoardId = BId;
            this.BoardName = BName;
            this.BoardMoney = BMoney;
            this.BoardDelivery = BDelivery;
            this.BoardDate = BDate;
            System.debug('ID :' + this.BoardId + ',Name :' + this.BoardName + ',Money :' + this.BoardMoney + ',Delivery :' + this.BoardDelivery + ',Date :' + this.BoardDate);
        }
    }
    @AuraEnabled
    public static List<ObjectBoardWrap> getRecords(String objName) {
       // ログイン中のユーザIDを取得
       String userS = UserInfo.getUserId();
       System.debug('UserName :' + userS);
        
       // 各レコード情報を所有者IDか取引先責任者で絞って、各ユーザのTodoリストを構成
       String deli = 'SELECT Id,Name,BusinessDelivery__c,TotalAmount__c,ExpirationDate__c FROM ' + objName +' WHERE OwnerId = :userS OR BusinessPartner__c = :userS ORDER BY BusinessDelivery__c ASC LIMIT 3';
       List<ObjectBoardWrap> board = new List<ObjectBoardWrap>();

       // クエリが複数のレコードを返すときに、sObject のリストを返します
       List <sObject> obj = Database.query(deli);

       // 見つけたレコードの数だけをそれぞれ値に代入
       for(sObject b : obj){
           board.add(new ObjectBoardWrap(
           String.valueOf(b.get('Id')),
           String.valueOf(b.get('Name')),
           String.valueOf(b.get('TotalAmount__c')),
           Date.valueOf(b.get('BusinessDelivery__c')),
           Date.valueOf(b.get('ExpirationDate__c'))
           ));
       }
       return board;
   }
}
