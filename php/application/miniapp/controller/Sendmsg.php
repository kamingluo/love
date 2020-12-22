<?php
namespace app\miniapp\controller\temmsg;
use think\Db;
use think\Request;
use think\Config;
use think\Log;

class Sendmsg
{


     //收集用户授权同意过的推送
     public function collectmsg(Request $request)
     {
          $time =date('Y-m-d H:i:s',time());//获取当前时间
          $openid=$request->param("openid");//用户openid
          $temmsg_id=$request->param("temmsg_id");//推送id
          $dbdata = ['id'=>'','openid' =>$openid,'temmsg_id' =>$temmsg_id,'create_time' =>$time];
          $dbreturn=db('temmsg')->insert($dbdata);
          if($dbreturn==1){
             return ['state'   => '200','message'  => "新增推送记录成功"] ;
          }
          else{
             return ['state'   => '400','message'  => "新增推送记录失败"] ;
          }      
     }


  //群主发群新闻给群员通知
   // public function pushnewmsg(Request $request)
   //  {
   //     $crowd_id=$request->param("crowd_id");//哪个群推送的
   //     $crowd_name=$request->param("crowd_name");//推送的群名称啊
   //     $access_token=wxtoken();//拿到token
   //     //拿到要推送的值
   //     $sql = "select *, count(distinct openid) from temmsg where crowd_id =".$crowd_id." group by openid ;";
   //     $msgdata = Db::query($sql); //拿到数据
   //     $count = count($msgdata);//拿到数值条数
   //     foreach($msgdata as $count  => $data){
   //       $openid=$data["openid"];
   //       $openid=$data["openid"];
   //      $resdata=msgpushnew($openid,$access_token,$crowd_name);
   //      $clear=db('temmsg')-> where('id', $data["id"])->delete();
   //    }
   //     // $emaildata=sendEmail([['user_email'=>'954087620@qq.com','content'=>'签到推送完毕']]); //想推送不知道为啥不行
   //     return ['state'   => '200','message'  => "发送消息推送完成"] ;
   //  }

}

