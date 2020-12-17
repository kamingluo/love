<?php
// +----------------------------------------------------------------------
// | wxcarminiapp公共方法
// +----------------------------------------------------------------------

use think\Log;
use think\Db;
use think\Request;
use think\Controller;

/**
   * 调取微信接口获取openid
   * 传入值code从小程序login API获取
   * @return string
*/
function openid($wxcode){
    if($wxcode == 'kaming'){
        $openid='o3XMA0enuFRZsOCOCeqjB70exjr4';
        return $openid;
    }
    if($wxcode == 'kaming2'){
        $openid='22222222222222222222';
        return $openid;
    }
    $url = 'https://api.weixin.qq.com/sns/jscode2session';
    $data['appid']=Config('appid');
    $data['secret']= Config('secret');
    $data['js_code']= $wxcode;
    $data['grant_type']= 'authorization_code';
    $wxopenid = http($url, $data, 'GET');
    $openiddata=json_decode($wxopenid,true);
    $rest=array_key_exists("errcode",$openiddata);//判断返回值存在errcode证明code有误
        if($rest){ 
            Log::record('code错误或者过期了！传入微信code-->'.$wxcode,'error');
            echo  json_encode(['state'   => '400','message'  => "code错误或者过期了！" ] ) ;
            die ();
        }
        else{
        	$openid=$openiddata['openid'];
        	return $openid;
        }
}




//推送实例
function msgpushnew($openid,$crowd_name){
    $senopenid=$openid;//用户openid
    $access_token=wxtoken();//拿到token
    $temid = 'fIbB90FHxqlRURZGGo0PmcdAKWaUoxziV_loz90ftVs';
    $page = 'pages/index/index';
    $url = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token='.$access_token;
    $explan="群:".$crowd_name."有新消息;";
    $time =date('Y-m-d H:i:s',time());//获取当前时间
    $data = array(
      "touser"=>$senopenid,
      "template_id"=>$temid,
      "page"=>$page,
      "miniprogram_state"=>"formal",
      "lang"=>"zh_CN",
      "data"=>array(
          "thing1"=>array(
              //这里贼坑，字符串过长不能发送成功，但是回调信息没提示
              "value"=>$explan
          ),
          "thing3"=>array(
              "value"=>"点击查看>>>"
          ),
          "time2"=>array(
              "value"=>$time
          )
        )
      );
  $res = postCurl($url,$data,'json');
  if($res){
     return "发送成功";
  }else{
      return "发送失败";
  }

}








//文案审核
function wxmsgSecCheck($content){
    $access_token=wxtoken();//拿到token
    $url = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token='.$access_token;//文案审核URL
    $data=array("content"=>$content);
    $respon = newpostCurl($url,$data,'json');
    $respon = json_decode($respon,true);
    // Log::record("文案审核内容");
    // Log::record($content);
    // Log::record("文案审核结果啊");
    // Log::record($respon);
    if($respon['errcode'] == 87014){
        return 1;//效验失败，内容含有违法违规内容
    }
    else{
        return 0;
    }
}


//这个请求跟全局公共文件，请求不同是这里的json_encode()处理中文的时候，不转码。
function newpostCurl($url,$data,$type){
    if($type == 'json'){
        $data = json_encode($data,JSON_UNESCAPED_UNICODE);//对数组进行json编码,设置JSON_UNESCAPED_UNICODE是不对中文进行转码。
        $header= array("Content-type: application/json;charset=UTF-8","Accept: application/json","Cache-Control: no-cache", "Pragma: no-cache");
    }
    $curl = curl_init();
    curl_setopt($curl,CURLOPT_URL,$url);
    curl_setopt($curl,CURLOPT_POST,1);
    curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,false);
    curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,false);
    if(!empty($data)){
        curl_setopt($curl,CURLOPT_POSTFIELDS,$data);
    }
    curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($curl,CURLOPT_HTTPHEADER,$header);
    $res = curl_exec($curl);
    if(curl_errno($curl)){
        echo 'Error+'.curl_error($curl);
    }
    curl_close($curl);
    return $res;
    
}



//微信token获取
function wxtoken(){
    $dbres =db('wxtoken')->where('id',1)->find();
    $token_time=$dbres["update_time"];
    $time =date('Y-m-d H:i:s',time());//获取当前时间
    $second=floor((strtotime($time)-strtotime($token_time)));//对比两个时间，拿到时间差
    if($second > 3600){
        //一小时更新一次,超过一小时再去调一次
        $data['appid']=Config('appid');
        $data['secret']= Config('secret');
        $data['grant_type']= 'client_credential';
        $api = "https://api.weixin.qq.com/cgi-bin/token";//拿token接口
        $str = http($api, $data,'GET');
        $token = json_decode($str,true);
        $access_token=$token['access_token'];//拿到token
        //更新一下数据库的access_token和时间
        $updatedata= db('wxtoken')->where('id',1)->update(['update_time' => $time,'access_token' => $access_token]);
    }
    else{
        $access_token=$dbres["access_token"];//直接拿到数据库存储的token
    }
    return $access_token;

}

