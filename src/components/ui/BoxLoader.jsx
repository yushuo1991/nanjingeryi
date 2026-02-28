import React from 'react';
import './BoxLoader.css';

const BoxLoader = ({ message = 'AI识别中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="loader">
        <div className="ground">
          <div></div>
        </div>
        <div className="box box0">
          <div></div>
        </div>
        <div className="box box1">
          <div></div>
        </div>
        <div className="box box2">
          <div></div>
        </div>
        <div className="box box3">
          <div></div>
        </div>
        <div className="box box4">
          <div></div>
        </div>
        <div className="box box5">
          <div></div>
        </div>
        <div className="box box6">
          <div></div>
        </div>
        <div className="box box7">
          <div></div>
        </div>
      </div>
      {message && (
        <p className="text-sm text-slate-600 mt-4 font-medium">{message}</p>
      )}
    </div>
  );
};

export default BoxLoader;
