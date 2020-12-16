<?php
namespace app\miniapp\controller;
use think\Db;
use think\Request;
use think\Config;

class Question
{
    //发起问题
    public function launchquestion(Request $request)
    {
    	return  "所以，爱会消失吗？" ;
    }

    //回复问题
    public function replyquestion(Request $request)
    {
    	return  "所以，爱会消失吗？" ;
    }

    //用户查看问自己的问题
    public function myquestion(Request $request)
    {
    	return  "所以，爱会消失吗？" ;
    }

    //被分享用户进来，查看已经问分享者的问题
    public function shareuserquestion(Request $request)
    {
    	return  "所以，爱会消失吗？" ;
    }

    //删除问题
    public function delquestion(Request $request)
    {
    	return  "所以，爱会消失吗？" ;
    }



}
