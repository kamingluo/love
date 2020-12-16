<?php
    /**
     * 发送HTTP请求方法
     * @param  string $url    请求URL
     * @param  array  $params 请求参数
     * @param  string $method 请求方法GET/POST
     * @return array  $data   响应数据
     */
    function http($url, $params, $method = 'GET', $header = array(), $multi = false){
        $opts = array(
                CURLOPT_TIMEOUT        => 30,
                CURLOPT_RETURNTRANSFER => 1,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_HTTPHEADER     => $header
        );
        /* 根据请求类型设置特定参数 */
        switch(strtoupper($method)){
            case 'GET':
                $opts[CURLOPT_URL] = $url . '?' . http_build_query($params);
                break;
            case 'POST':
                //判断是否传输文件
                $params = $multi ? $params : http_build_query($params);
                $opts[CURLOPT_URL] = $url;
                $opts[CURLOPT_POST] = 1;
                $opts[CURLOPT_POSTFIELDS] = $params;
                break;
            default:
                throw new Exception('不支持的请求方式！');
        }
        /* 初始化并执行curl请求 */
        $ch = curl_init();
        curl_setopt_array($ch, $opts);
        $data  = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);
        if($error) throw new Exception('请求发生错误：' . $error);
        return  $data;
    }



    function postCurl($url,$data,$type){
      if($type == 'json'){
          $data = json_encode($data);//对数组进行json编码
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




    function getcurl($url, $postFields = null)
      {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FAILONERROR, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt ( $ch, CURLOPT_USERAGENT, "top-sdk-php" );
        //https 请求
        if(strlen($url) > 5 && strtolower(substr($url,0,5)) == "https" ) {
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
          curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }

        if (is_array($postFields) && 0 < count($postFields))
        {
          $postBodyString = "";
          $postMultipart = false;
          foreach ($postFields as $k => $v)
          {
            if("@" != substr($v, 0, 1))//判断是不是文件上传
            {
              $postBodyString .= "$k=" . urlencode($v) . "&"; 
            }
            else//文件上传用multipart/form-data，否则用www-form-urlencoded
            {
              $postMultipart = true;
              if(class_exists('\CURLFile')){
                $postFields[$k] = new \CURLFile(substr($v, 1));
              }
            }
          }
          unset($k, $v);
          curl_setopt($ch, CURLOPT_POST, true);
          if ($postMultipart)
          {
            if (class_exists('\CURLFile')) {
                curl_setopt($ch, CURLOPT_SAFE_UPLOAD, true);
            } else {
                if (defined('CURLOPT_SAFE_UPLOAD')) {
                    curl_setopt($ch, CURLOPT_SAFE_UPLOAD, false);
                }
            }
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
          }
          else
          {
            $header = array("content-type: application/x-www-form-urlencoded; charset=UTF-8");
            curl_setopt($ch,CURLOPT_HTTPHEADER,$header);
            curl_setopt($ch, CURLOPT_POSTFIELDS, substr($postBodyString,0,-1));
          }
        }
        $reponse = curl_exec($ch);
        
        if (curl_errno($ch))
        {
          throw new Exception(curl_error($ch),0);
        }
        else
        {
          $httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
          if (200 !== $httpStatusCode)
          {
            throw new Exception($reponse,$httpStatusCode);
          }
        }
        curl_close($ch);
        return $reponse;
      }

