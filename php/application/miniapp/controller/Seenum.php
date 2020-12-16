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
    	return  "所以，爱会消失吗？" ;
    }

    //操作用户的次数，加或者减
    public function operationnum(Request $request)
    {
    	return  "所以，爱会消失吗？" ;
    }

}
