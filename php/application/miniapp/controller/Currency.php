<?php
namespace app\miniapp\controller;
use think\Db;
use think\Request;
use think\Config;

class Currency
{
   
 

  public function getqrcode(Request $request)
    {
      $userid=$request->param("userid");
      //$channel=$request->param("channel");
      $channel=1000;//二维码渠道
      if (is_file('./qrcode/'.$userid.'.png')){
        return ['state'   => '200','message'  => "二维码已经存在" ,'type' => 'success'] ;
      }else{
        $access_token=wxtoken();//拿到token
        $url = "https://api.weixin.qq.com/wxa/getwxacode?access_token=$access_token";//生成二维码接口地址
        $data = json_encode(array("path"=>"pages/question/question?answer_userid=$userid&channel=$channel","width"=> 280));
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_HEADER, 'image/gif');
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_POSTFIELDS,$data);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data)
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); //如果需要将结果直接返回到变量里，那加上这句。
        $res = curl_exec($ch);
        $image = 'data:image/jpeg;base64,'.base64_encode($res);//补全base64加密字符串头
        if (strstr($image,",")){
          $image = explode(',',$image);
          $image = $image[1];
        }
        $path = "./qrcode";
        if (!is_dir($path)){ //判断目录是否存在 不存在就创建
          mkdir($path,0777,true);
        }
        $imageSrc= $path."/". $userid.'.png'; //图片名字
        $r = file_put_contents($imageSrc, base64_decode($image));//返回的是字节数
        if ($r) {
          return ['state'   => '200','message'  => "二维码生成成功" ,'type' => 'success'] ;
        }else{
          return ['state'   => '400','message'  => "二维码生成失败" ,'type' => 'fail'] ;
        }
      }

    }



}
