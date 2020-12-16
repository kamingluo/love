<?php
namespace app\miniapp\controller;
use think\Db;
use think\Request;
use think\Config;

class Statistics
{
    public function statistics(Request $request)
    {
        set_time_limit(0);//设置超时时间
       
        $state=['state'   => '200','message'  => "这是统计接口" ];
        return $state;
    }

    
}
