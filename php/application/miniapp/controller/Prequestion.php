<?php
namespace app\miniapp\controller;
use think\Db;
use think\Request;
use think\Config;

class Prequestion
{
    public function questionlist(Request $request)
    {

        $dbdata=db('pre_question')->order('id asc')->select();
        $state=['state'   => '200','message'  => "预设问题列表查询成功" ];
        $resdata=array_merge($state,array('questionlist'=>$dbdata));
        return $resdata ;
    }

}
