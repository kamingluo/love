<?php
namespace app\miniapp\controller;
use think\Db;
use think\Request;
use think\Config;

class Seenum
{
    //用户查看可以查看匿名者的次数
    public function mynum(Request $request)
    {
        $wxcode =$request->param("code");
        $openid=openid($wxcode);
        $dbnum =db('see_number')->where('openid',$openid)->find();//查询用户信息
        $number=0;
        if($dbnum==null){
            //没有数据，新增数据
            $time =date('Y-m-d H:i:s',time());//获取当前时间
            $dbdata = ['id'=>'','openid' =>$openid,'number' => 0,'create_time' =>$time];
            $Id= db('see_number')->insertGetId($dbdata);//返回自增ID
        }
        else{
            $number=$dbnum["number"];
        }
        $state=['state'   => '200','message'  => "查询用户可观看匿名次数成功",'number'  =>$number];

    	return  $state;
    }

    //操作用户的次数，加或者减
    public function operationnum(Request $request)
    {
        $openid =$request->param("openid");
        $type=$request->param("type");//0加1减

        if($type==0){
            $add= db('see_number')->where('openid',$openid)->setInc('number',1);
        }
        else{
            $reduce= db('see_number')->where('openid',$openid)->setDec('number',1);

        }
        $state=['state'   => '200','message'  => "操作用户可观看次数成功"];
    	return  $state;
    }

}
