import { useContext, useEffect } from "react";
import { SaveContext } from "../context/Save.js";
import { FileContext } from "../context/File.js"

export function useUpdateSaveState (e) {
  const { save, setSave } = useContext(SaveContext);

  function updateSaveState (e) {
    let element = e.target.parentElement
    let inputEl = element.querySelector('input')

    loadFileContent(inputEl)
  }

    function loadFileContent(inputEl) {
        let fl_files = inputEl.files;
        let fl_file = fl_files[0];

        var fr = new FileReader();
        fr.addEventListener('load', function () {
            setSave(bufferToHex(this.result))
        });
        fr.readAsArrayBuffer(fl_file);
    }

  return { updateSaveState };
}

export function useDownloadFile(e) {
    function downloadFile() {

    }

    return downloadFile
}

export function useUpdateFile(e) {
    const { save, setSave } = useContext(SaveContext);
    const { file, setFile } = useContext(FileContext);

    function updateFile() {
        let string = hexToBuffer(save)

        var file = new Blob([string], {type: 'application/octet-stream'});

        var a = document.createElement("a"),
        url = URL.createObjectURL(file);
        a.href = url;
        let inputEl = document.querySelector('input')
        let fl_files = inputEl.files;
        let fl_file = fl_files[0];
        a.download = fl_file.name;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 

    }

    return { updateFile }
}

function bufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    return Array.from(byteArray).map(byte => ('00' + byte.toString(16)).slice(-2)).join('');
}

// Function to convert Hexadecimal string back to ArrayBuffer
function hexToBuffer(hexString) {
    const byteArray = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return byteArray.buffer;
}