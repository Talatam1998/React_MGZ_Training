import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from 'react-bootstrap/Table';
import './css/customs.css';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { read, utils, writeFile } from 'xlsx';
import ReactDOM from 'react-dom';
import ReactPaginate from 'react-paginate';

const App = () => {
  

  const [human, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [addHuman,setHuman] = useState([]);
  const [checkEdit, setCheckEdit] = useState('');
  const [billionaire, setBillionaire] = useState({
    id: '',
    name: '',
    assets: '',
    age: '',
  });
  const [dataEdit, setDataEdit] = useState({
    id: '',
    name: '',
    assets: '',
    age: '',
  });


  useEffect(() => {
    let url = 'https://6304eb1b697408f7edbe295c.mockapi.io/api/human';
    if (searchTerm.length > 0) {
      url = url + '?search=' + searchTerm;
    }
    console.log(url);
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data);
      });
  }, [searchTerm]);

  var data_list = [];
  if (human != null) {
    data_list = human.map((item) => (
      <tr key={item.id}>
        {item.id != checkEdit ? <>
          <th>{item.id}</th>
          <th>{item.name}</th>
          <th>{item.assets}</th>
          <th>{item.age}</th>
        </> : <>
          <th>{dataEdit.id}</th>
          <th><input
            type={"text"}
            value={dataEdit.name}
            name="name"
            onChange={(e) => handleChangeDataEdit(e)}

          ></input></th>
          <th><input
            type={"text"}
            value={dataEdit.assets}
            name="assets"
            onChange={(e) => handleChangeDataEdit(e)}
          ></input></th>
          <th><input
            type={"text"}
            value={dataEdit.age}
            name="age"
            onChange={(e) => handleChangeDataEdit(e)}
          ></input></th>
        </>}

        <th>
          {item.id != checkEdit ? <>
            <button type="button" class="btn btn-outline-primary"
              onClick={() => {
                setCheckEdit(item.id)
                setDataEdit(item);
              }
              }>Edit</button>
            <button type="button" class="btn btn-outline-primary" onClick={() => deleteData(item.id)}>Delete</button>
          </> : <>
            <button type="button" class="btn btn-outline-primary" onClick={() => {
              editHandleChange()
              setCheckEdit(undefined)
            }
            }>Submit</button>
            <button type="button" class="btn btn-outline-primary" onClick={() => setCheckEdit(undefined)}>Cancel</button>
          </>}
        </th>
      </tr>
    ));
  }


  const deleteData = (id) => {
    fetch('https://6304eb1b697408f7edbe295c.mockapi.io/api/human/' + id, {
      method: 'DELETE',
    }).then(() => {
      let result = [...human];
      result = result.filter((human) => {
        return human.id != id;
      });
      setData(result);
    });
  };

  const handleChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    setBillionaire((prevalue) => {
      return {
        ...prevalue,
        [name]: value
      }
    })
  }

  const handleChangeDataEdit = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    setDataEdit((prevalue) => {
      return {
        ...prevalue,
        [name]: value
      }
    })
  }

  const editHandleChange = () => {
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataEdit),
    };

    fetch(
      'https://6304eb1b697408f7edbe295c.mockapi.io/api/human/' + dataEdit.id, requestOptions
    )
      .then((response) => {
        response.json()
        // console.log('response' , response.json())
        // let index = human.findIndex((item) => item.id == response.id)
        // human[index] = response
      }
      ).then((data) => {
        console.log(data);
        window.location.reload()
      })
  };

  const saveHuman = () => {

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billionaire),
    };

    fetch(
      'https://6304eb1b697408f7edbe295c.mockapi.io/api/human/', requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        window.location.reload()
      });
  }

  const sortColumnASC = (field, type) => {
    console.log(field, type)
    const sortData = [...human];
    if (type == 'string') {
      sortData.sort((a, b) => a[field].localeCompare(b[field]));
    } else if (type == 'number') {
      sortData.sort((a, b) => (a[field] - b[field]));
    }
    setData(sortData)
  };

  const sortColumnDESC = (field, type) => {
    console.log(field, type)
    const sortData = [...human];
    if (type == 'string') {
      sortData.sort((a, b) => -1 * a[field].localeCompare(b[field]));
    } else if (type == 'number') {
      sortData.sort((a, b) => -1 * (a[field] - b[field]));
    }
    setData(sortData)
  };

  const handleChangeSort = (e) => {
    const a = e.target.value;
    console.log(a);
    if (a == 'nameASC') {
      sortColumnASC('name', 'string');
    }
    if (a == 'assetsASC') {
      sortColumnASC('assets', 'string');
    }
    if (a == 'ageASC') {
      sortColumnASC('age', 'number');
    }
    if (a == 'nameDESC') {
      sortColumnDESC('name', 'string');
    }
    if (a == 'assetsDESC') {
      sortColumnDESC('assets', 'string');
    }
    if (a == 'ageDESC') {
      sortColumnDESC('age', 'number');
    }
  }

  const handleImport = ($event) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          setData(rows)
          console.log(rows)
        }
      }
      reader.readAsArrayBuffer(file);
    }
  }

  

  return (
    <div className="body">
      <div className="searchNew">
        <div className='search'>
          <input
            type={"text"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
            className='button'
          ></input>
        </div>
        <select onChange={handleChangeSort} className='button'>
          <option value="" >Sort by </option>
          <option value="nameASC" >Name ASC </option>
          <option value="assetsASC" >Assets ASC</option>
          <option value="ageASC">Age ASC</option>
          <option value="nameDESC" >Name DESC </option>
          <option value="assetsDESC" >Assets DESC</option>
          <option value="ageDESC">Age DESC</option>
        </select>
        {/* <table class="table">
          <tbody>
            <tr>

              <td> */}
        <div className='newExport'>
          <div className='new'>
            <input
              type={"text"}
              value={billionaire.name}
              name="name"
              onChange={(e) => handleChange(e)}
              placeholder="Name"
              className='button'
            ></input>
            {/* </td>
              <td> */}
            <input
              type={"text"}
              value={billionaire.assets}
              name="assets"
              onChange={(e) => handleChange(e)}
              placeholder="Assets"
              className='button'
            ></input>
            {/* </td>
              <td> */}
            <input
              type={"text"}
              value={billionaire.age}
              name="age"
              onChange={(e) => handleChange(e)}
              placeholder="Age"
              className='button'
            ></input>
            {/* </td>
            </tr>
          </tbody>
        </table> */}
            <div>
              <button type="button"
                onClick={() => saveHuman()}
              // className='button'
              >
                Submit
              </button>
            </div>

          </div>
          <div className='export'>
            <CSVLink data={human} className="btn btn-success mb-3" >Export</CSVLink>
            <div className="custom-file">
              <input type="file" name="file" className="custom-file-input" id="inputGroupFile" required onChange={handleImport}
                accept="etml.csv, application/vnd.openxmlformats-officedocument.spreadshe.sheet, application/vnd.ms-excel" />
            </div>
          </div>
        </div>
      </div>

      <Table striped>
        <th>ID</th>
        <th>Name</th>
        <th>Assets</th>
        <th>Age</th>
        <th>Action</th>
        {data_list}
      </Table>

    </div>
  );
}

export default App;
