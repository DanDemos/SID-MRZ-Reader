import logo from './logo.svg';
import './App.css';
import { useState, useEffect, useRef } from 'react';
const parse = require('mrz').parse;

let mrz = [
  '',
  '',
  '',
];

// 'I<UTOD23145890<1233<<<<<<<<<<<',
// '7408122F1204159UTO<<<<<<<<<<<6',
// 'ERIKSSON<<ANNA<MARIA<<<<<<<<<<',

let documentNo

function App() {
  const [message, setMessage] = useState("");
  const [arr, setarr] = useState([]);
  const [mrzOne, setmrzOne] = useState("");
  const [mrzTwo, setmrzTwo] = useState("");
  const [mrzThree, setmrzThree] = useState("");
  const [err, seterr] = useState("");

  const inputRef = useRef(null);

  function handleClickOutside() {
    inputRef.current.focus();
  }

  useEffect(() => {
    inputRef.current.focus();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBlur = () => {
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  };

  const formatDate = (dateString, type = "birthday") => {
    if (dateString) {
      const yearPrefix = parseInt(dateString.substring(0, 2), 10);
      const threshold = 50;
      const year = yearPrefix < threshold ? 2000 + yearPrefix : 1900 + yearPrefix;
      const month = parseInt(dateString.substring(2, 4), 10) - 1; // Months are zero-based
      const day = parseInt(dateString.substring(4), 10);
      const dateObject = new Date(year, month, day);
      const formattedDateString = dateObject.toLocaleDateString('en-GB');
      // console.log(formattedDate);
      return formattedDateString
    }
    else { return "No Data"; }
  }

  const sendApi = async () => {
    const response = await fetch(`http://sidbooking.com/wp-json/api/taken_card/?document=${documentNo}`);
    const res = await response.json();
    console.log(res)
    try {
      if (res == 1) {
        setarr([])
      }
      else if (res == 0) {
        seterr("Already Exists!!!")
        throw new Error("Already Exists (Server response is 0)")
      }
      else {
        seterr("Unknown error!!!")
        throw new Error("Unknown error (Server response is not 0 or 1)")

      }
    } catch (error) {
      console.error(error);
    }

  }

  return (
    <div className="App">
      <h1>SID MRZ Reader</h1>
      <input
        style={{
          opacity: "0"
        }}
        ref={inputRef}
        value={message}
        onBlur={handleBlur}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            mrz[0] = e.target.value.slice(0, 30);
            mrz[1] = e.target.value.slice(30, 60);
            mrz[2] = e.target.value.slice(60, 90);
            setmrzOne(mrz[0])
            setmrzTwo(mrz[1])
            setmrzThree(mrz[2])
            var result = parse(mrz);
            let temp = []
            // { label: "Document code", field: "documentCode", value: "IS", … }
            documentNo = result?.details?.find(item => item.field === 'documentNumber')?.value

            temp.push(
              {
                label: "Name",
                value: result?.details?.find(item => item.field === 'firstName')?.value + result?.details?.find(item => item.field === 'lastName')?.value
              },
              {
                label: "Nationality",
                value: result?.details?.find(item => item.field === 'nationality')?.value
              },
              {
                label: "Gender",
                value: result?.details?.find(item => item.field === 'sex')?.value
              },
              {
                label: "Date of Birth",
                value: formatDate(result?.details?.find(item => item.field === 'birthDate')?.value, "birthday")
              },
              {
                label: "Document No.",
                value: result?.details?.find(item => item.field === 'documentNumber')?.value
              },
              {
                label: "Date of Expiry",
                value: formatDate(result?.details?.find(item => item.field === 'expirationDate')?.value, "expiry")
              },
            );
            // console.log(temp)
            setarr(temp)
            setMessage("")
          }
        }} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        {
          <table style={{ width: "auto" }}>
            <tbody>
              {
                arr?.length > 0
                  ?
                  arr?.map((value, keyB) => {
                    return (
                      <tr key={keyB}>
                        <td>
                          {value.label}
                        </td>
                        <td>
                          {value?.value ? value?.value : "No Data"}
                        </td>
                      </tr>
                    )
                  })
                  :
                  <>
                    <tr>
                      <td>Name
                      </td>
                      <td>
                      </td>
                    </tr>
                    <tr>
                      <td>Nationality
                      </td>
                      <td>
                      </td>
                    </tr>
                    <tr>
                      <td>Gender
                      </td>
                      <td>
                      </td>
                    </tr>
                    <tr>
                      <td>Date of Birth
                      </td>
                      <td>
                      </td>
                    </tr>
                    <tr>
                      <td>Document No
                      </td>
                      <td>
                      </td>
                    </tr>
                    <tr>
                      <td>Date of Expiry
                      </td>
                      <td>
                      </td>
                    </tr>
                  </>

              }
            </tbody>
          </table>
        }
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>

        <table style={{ width: "auto" }}>
          <tbody>
            <tr style={{ visibility: 'collapse' }}>
              <td>
              </td>
              <td>
              </td>
            </tr>
            <tr style={{ visibility: 'collapse' }}>
              <td>
              </td>
              <td>
              </td>
            </tr>
            <tr>

              <td colSpan="2">
                <button onClick={() => sendApi()}>
                  Withdraw
                </button>
              </td>

            </tr>
            {
              err
              &&
              <tr>
                <td colSpan="2" style={{color: "red", textAlign: "center"}}>
                  {err}
                </td>
              </tr>
            }


          </tbody>
        </table>

      </div>



      <div>
        {mrzOne}
      </div>
      <div>
        {mrzTwo}
      </div>
      <div>
        {mrzThree}
      </div>


    </div>
  );
}

export default App;
