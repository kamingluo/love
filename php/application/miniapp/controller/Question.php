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
        $question_userid =$request->param("question_userid");//提问者id
        $answer_userid =$request->param("answer_userid");//回答者id
        $question =$request->param("question");//问题
        $time =date('Y-m-d H:i:s',time());//获取当前时间
        $dbdata = ['id'=>'','question_userid' =>$question_userid,'answer_userid' => $answer_userid,'question' => $question,'answer' => null,'status' =>0,'anonymous' => 0,'create_time' =>$time];
        $questionId= db('question_answer')->insertGetId($dbdata);//返回自增ID
        //推送消息给回答者
        $openid=db('user')->where('id',$answer_userid)->value('openid');//查询回答者的openid
        $msgidresult=questions($openid);

        $state=['state'   => '200','message'  => "提问成功"];
        $resdata=array_merge($state,array('questionId'=>$questionId));
        return $resdata;
    }

    //回复问题
    public function replyquestion(Request $request)
    {
        $answer =$request->param("answer");//回答的内容
        $questionid =$request->param("questionid");//问题id
        $dbreturn= db('question_answer')->where('id',$questionid)->update(['answer' => $answer,'status' => 1]);

        //推送消息给问问题的人
        $question_userid=db('question_answer')->where('id',$questionid)->value('question_userid');//查询提问者的用户id
        $userdata=db('user')->where('id',$question_userid)->find('openid');//查询提问者的信息、、
        $openid=$userdata['openid'];
        $msgidresult=reply($openid);

        $state=['state'   => '200','message'  => "回复成功"];
    	return  $state;
    }

    //用户查看问自己的问题
    public function myquestion(Request $request)
    {
        $wxcode =$request->param("code");
        $openid=openid($wxcode);
        $dbdata =db('user')->where('openid',$openid)->find();//查询用户信息
        if($dbdata==null){
            $myquestionlist=[];
        }
        else{
            $answer_userid=$dbdata["id"];
            $sql = "select question_answer.*,user.nickName,user.avatarUrl from question_answer,user where question_answer.question_userid=user.id and question_answer.answer_userid='". $answer_userid." ORDER BY question_answer.id ASC';" ;
            $myquestionlist = Db::query($sql); //拿到数据

            //$myquestionlist=db('question_answer')->where('answer_userid',$dbdata["id"])->order('id asc')->select();
        }
        $state=['state'   => '200','message'  => "用户查看问自己的问题" ];
        $resdata=array_merge($state,array('myquestionlist'=>$myquestionlist));
        return $resdata ;
    }

    //被分享用户进来，查看已经问分享者的问题
    public function shareuserquestion(Request $request)
    {
        $answer_userid =$request->param("answer_userid");//回答者id
        $answer_userdata =db('user')->where('id',$answer_userid)->find();//查询回答者用户信息

        $wxcode =$request->param("code");
        $openid=openid($wxcode);//提问者openid
        $dbdata =db('user')->where('openid',$openid)->find();//查询用户信息
        if($dbdata==null){
            $questionlist=[];
        }
        else{
            // $question_userid=$dbdata["id"];
            // $sql = "select question_answer.*,user.nickName,user.avatarUrl from question_answer,user where question_answer.question_userid=user.id and question_answer.answer_userid='". $answer_userid."';" ;
            // $myquestionlist = Db::query($sql); //拿到数据

            $questionlist=db('question_answer')->where('answer_userid',$answer_userid)->where('question_userid',$dbdata["id"])->order('id ASC')->select();
        }
        $state=['state'   => '200','message'  => "被分享用户进来，查看已经问分享者的问题" ];
        $resdata=array_merge($state,array('questionlist'=>$questionlist),array('answeruserdata'=>$answer_userdata));
        return $resdata ;
    }

    //删除问题
    public function delquestion(Request $request)
    {
        $questionid =$request->param("questionid");//问题id
        $cleardata=db('question_answer')-> where('id',$questionid)->delete();
        if($cleardata ==1){
             $state=['state'   => '200','message'  => "删除成功"];
        }
        else{
             $state=['state'   => '400','message'  => "删除失败"];
        }
        return  $state;
    }

     //设置问题为不匿名，并扣除 匿名次数1
     public function seeanonymous(Request $request)
     {
         //设置问题为不匿名
         $questionid =$request->param("questionid");//问题id
         $openid=$request->param("openid");//用户openid
         $dbreturn= db('question_answer')->where('id',$questionid)->update(['anonymous' =>1]);
         //$reduce= db('see_number')->where('openid',$openid)->setDec('number',1);//已经在前端请求扣除了
         $state=['state'   => '200','message'  => "操作不匿名成功"];
         return  $state;
     }



}
