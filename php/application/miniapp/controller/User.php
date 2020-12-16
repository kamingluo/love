<?php
// +----------------------------------------------------------------------
// | 用户信息操作
// +----------------------------------------------------------------------
namespace app\miniapp\controller;
use think\Db;
use think\Request;
use think\Exception;
use think\Log;

class User
{
   /** 用户注册未授权 */
public function register(Request $request){
    $data = $request->param();//接收所有传过来的post值
    $wxcode =$request->param("code");
    $openid=openid($wxcode);
    $scene=$request->param("scene");
    $channel=$request->param("channel");
    $time =date('Y-m-d H:i:s',time());//获取当前时间
    $dbnum =db('user')->where('openid',$openid)->find();//查询用户信息
    //return  $dbnum["channel"];
    if($dbnum==null){
            $dbdata = ['id'=>'','openid' =>$openid,'channel' => $channel,'scene' => $scene,'nickName' => null,'avatarUrl' => null,'gender' => null,'province' => null,'city' => null,'country' => null,'create_time' =>$time ,'update_time' =>$time];
            $userId= db('user')->insertGetId($dbdata);//返回自增ID
            $userdata=['id'=>$userId,'openid' =>$openid,'channel' => $channel,'scene' => $scene,'nickName' => null,'avatarUrl' => null,'gender' => null,'province' => null,'city' => null,'country' => null,'create_time' =>$time ,'update_time' =>$time];
            $state=['state'   => '200','message'  => "注册成功"];
            $resdata=array_merge($state,array('userdata'=>$userdata));
            return $resdata;
        }
    else{
             //更新信息
            $dbreturn= db('user')->where('openid',$openid)->update(['update_time' => $time,'scene' => $scene]);
            if($dbreturn==1){
                $dbnum =db('user')->where('openid',$openid)->find();//查询用户信息
                $state=['state'   => '200','message'  => "用户信息更新成功"];
                $resdata=array_merge($state,array('userdata'=>$dbnum));
                return $resdata;
            }
            else{
                 $dbreturn=['state'   => '400','message'  => "用户信息更新失败" ];
                return $dbreturn;
            }
        }
}
/** 用户注册已经授权 */
public function authorized(Request $request){
        $wxcode =$request->param("code");
        $openid=openid($wxcode);
        $scene=$request->param("scene");
        $channel=$request->param("channel");
        $nickName=$request->param("nickName");
        $avatarUrl=$request->param("avatarUrl");
        $gender=$request->param("gender");
        $province=$request->param("province");
        $city=$request->param("city");
        $country=$request->param("country");
        $time =date('Y-m-d H:i:s',time());
        $dbnum =db('user')->where('openid',$openid)->find();//查询用户信息
    //return  $dbnum["channel"];
        if($dbnum==null){
                $dbdata = ['id'=>'','openid' =>$openid,'channel' => $channel,'scene' => $scene,'nickName' => $nickName,'avatarUrl' =>$avatarUrl,'gender' =>$gender,'province' => $province,'city' => $city,'country' => $country,'create_time' =>$time ,'update_time' =>$time];
                $userId= db('user')->insertGetId($dbdata);//返回自增ID
                $userdata=['id'=>$userId,'openid' =>$openid,'channel' => $channel,'scene' => $scene,'nickName' => $nickName,'avatarUrl' =>$avatarUrl,'gender' =>$gender,'province' => $province,'city' => $city,'country' => $country,'create_time' =>$time ,'update_time' =>$time];
                $state=['state'   => '200','message'  => "授权注册成功"  ];
                $resdata=array_merge($state,array('userdata'=>$userdata));
                return $resdata;
            }
        else{
                //更新信息
                $dbreturn= db('user')->where('openid',$openid)->update(['update_time' => $time,'scene' => $scene,'nickName' => $nickName,'avatarUrl' =>$avatarUrl,'gender' =>$gender,'province' => $province,'city' => $city,'country' => $country]);
                if($dbreturn==1){
                    $dbnum =db('user')->where('openid',$openid)->find();//查询用户信息
                    $state=['state'   => '200','message'  => "授权用户信息更新成功"];
                    $resdata=array_merge($state,array('userdata'=>$dbnum));
                    return $resdata;
                }
                else{
                    $dbreturn=['state'   => '400','message'  => "用户信息更新失败" ];
                    return $dbreturn;
                }
            }
}
//请求获取用户openid
public function obtainopenid(Request $request){
        $wxcode =$request->param("code");//接收所有传过来的值
        $openid=openid($wxcode);
        $state=['state'   => '200','message'  => "获取用户openid成功" ];
        $resdata=array_merge($state,array('openid'=>$openid));
        return $resdata;
}
//获取用户用户信息
public function userdata(Request $request){
        $wxcode =$request->param("code");//接收所有传过来的值
        $openid=openid($wxcode);
        $dbnum =db('user')->where('openid',$openid)->find();//查询用户信息
        $state=['state'   => '200','message'  => "获取用户信息成功" ];
        $resdata=array_merge($state,array('userdata'=>$dbnum));
        return $resdata;
}


}
