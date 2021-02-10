package com.amazonaws.helper;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader; 
import java.io.IOException; 
import java.io.InputStream; 
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStream; 
import java.io.Reader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class to send operational metrics.
 *
 * <p>Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.</p>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 * <p>
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

public final class MetricsUtil {

    private static final Logger logger = LoggerFactory.getLogger(MetricsUtil.class);

    public static void sendMetrics(String process, String status, String details, boolean isTranscribed, boolean isEncrypted, String languageCode) {
        if (!System.getenv("SEND_ANON_DATA").equals("true")) {
            return;
        }
        
        try {
            JSONObject parameters = createParameters(process, status, details, isTranscribed, isEncrypted, languageCode);
            HttpURLConnection connection = createConnection(parameters);
            
            connection.connect();

            readResponse(connection);

            connection.disconnect();
        } catch (Exception e) {
            logger.info("Error sending metrics to AWS." + e.getLocalizedMessage());
            e.printStackTrace();
        }
    }

    private static JSONObject createParameters(String process, String status, String details,
                                                        boolean isTranscribed, boolean isEncrypted, String languageCode) {
        JSONObject dataJson = new JSONObject();
        dataJson.put("process", process);
        dataJson.put("status", status);
        dataJson.put("details", details);
        dataJson.put("isTranscribed", String.valueOf(isTranscribed));
        dataJson.put("isEncrypted", String.valueOf(isEncrypted));
        dataJson.put("languageCode", languageCode);

        Date date = new Date();

        JSONObject parameters = new JSONObject();
        parameters.put("Solution", System.getenv("SOLUTION_ID"));
        parameters.put("UUID", System.getenv("UUID"));
        parameters.put("TimeStamp", date.toInstant().toString());
        parameters.put("Data", dataJson.toString());
        logger.info("Set all the parameters for the request: " + parameters.toString());

        return parameters;
    }

    private static HttpURLConnection createConnection(JSONObject parameters) throws Exception {
        URL url = new URL("https://metrics.awssolutionsbuilder.com/generic");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestMethod("POST");
        connection.setInstanceFollowRedirects(true);
        connection.setDoOutput(true);

        OutputStream out = connection.getOutputStream();
        out.write(parameters.toString().getBytes());
        out.flush();
        out.close();

        return connection;
    }

    private static void readResponse(HttpURLConnection connection) throws Exception {
        int statusCode = connection.getResponseCode();
        logger.info("connection opened with response code: " + statusCode);
 
        Reader streamReader = null;
        
        if (statusCode > 299) {
            streamReader = new InputStreamReader(connection.getErrorStream());
        } else {
            streamReader = new InputStreamReader(connection.getInputStream());
        }

        BufferedReader in = new BufferedReader(streamReader);
        String inputLine;
        StringBuffer content = new StringBuffer();
        while ((inputLine = in.readLine()) != null) {
            content.append(inputLine);
        }
        in.close();

        if (statusCode > 299) {
            logger.info("Failure when sending message with status code: " + statusCode);
            logger.info(content.toString());
        } else {
            logger.info("Successfully sent message with status code: " + statusCode);
            logger.info(content.toString());
        }
    }
}