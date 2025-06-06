"use client";

import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  // const [responseMsg, setResponseMsg] = useState('');

  console.log("this is a input value", inputValue);

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const shop = inputValue;

      // URL me query parameters ke roop me bhejna
      // const res = await fetch(`/api/auth?shop=${shop}`, {
      //     method: 'GET',
      // });

      // const data = await res.json();
      // console.log("Response data:", data);
      window.location.href = `/api/auth?shop=${shop}`;
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const openThemeEditor = async (e) => {
    try{
    const response = await fetch("/api/theme-id");
    const responseData = await response.json();
    const themeId = responseData.themeId;
    const shop = responseData.shop;
    console.log("this is a theme id frontend:", themeId, shop);

    // theme setting url
    const url = `https://${shop}/admin/themes/${themeId}/editor?context=apps`;
    window.open(url, "_blank");
    }catch(error){
        return new Response(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center  text-black">
          Shops
        </h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter something"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500  text-black"
          />
        </div>
        <button
          onClick={handleClick}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Submit
        </button>
        {/* {responseMsg && (
                    <p className="mt-4 text-center text-green-600 font-medium">{responseMsg}</p>
                    )} */}
        <div className="pt-4">
          <button
            className="text-zinc-200 bg-black hover:bg-gray-700 py-2 px-2 rounded"
            onClick={openThemeEditor}
          >
            Theme Setting
          </button>
        </div>
      </div>
    </div>
  );
}
