import React from 'react'
import {
  CRow, CCol, CCardBody, CButton, CForm, CLabel, CFormGroup, CModal, CAlert, CDataTable, CSelect,
  CModalBody, CModalFooter, CModalHeader, CCard, CCardHeader, CInput, CButtonToolbar, CButtonGroup
} from '@coreui/react'
import Select from 'react-select'
import axios from 'axios'

const parseResponse = (response) => response.json().then(text => (text));

const fields = [
  { key: 'id', label: 'ID', _style: { width: '3%' }, filter: false, sorter: false },
  { key: 'user', _style: { width: '10%' } },
  { key: 'product', _style: { width: '20%' } },
  { key: 'quantity', _style: { width: '5%' } },
  { key: 'grand_total', label: 'Total', _style: { width: '5%' }, filter: false, sorter: false },
  { key: 'discount', _style: { width: '4%' }, filter: false, sorter: false },
  { key: 'createdAt', label: 'Date', _style: { width: '10%' }, filter: false, sorter: false },
  { key: 'actions', label: 'Actions', _style: { width: '3%' }, filter: false, sorter: false }
]

class Orders extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      successalert: '',
      failalert: '',
      orders: [],
      users: [],
      products: [],
      modalInsert: false,
      modalEdit: false,
      id_order: '',
      user: '',
      product: '',
      quantity: '',
      warnings: {}
    }
  }

  componentDidMount() {
    fetch(`http://localhost:5000/users`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => parseResponse(res))
      .then((data) => {
        data.map(ele => {
          return (this.state.users.push({ value: ele._id, label: ele.name }));
        })
      })
      .catch(err => {
        this.props.history.push('/err');
      })

    fetch(`http://localhost:5000/products`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => parseResponse(res))
      .then((data) => {
        data.products.map(ele => {
          return (this.state.products.push({ value: ele._id, label: ele.name }));
        })
      })
      .catch(err => {
        this.props.history.push('/err');
      })

    this.getOrders();
    setInterval(() => {
      this.setState({ successalert: '', failalert: '' });
    }, 10000);
  }

  getOrders = async () => {
    const { status, data } = await axios.get(`http://localhost:5000/orders`)
    if (status === 200) this.setState({ orders: data.orders });
    else this.props.history.push('/err');
  }

  search = async (date) => {
    this.setState({ orders: [] })
    const { status, data } = await axios.get(`http://localhost:5000/orders`, { params: { sort: date } })
    if (status === 200) this.setState({ orders: data.orders });
    else this.props.history.push('/err');
  }

  closeModal = () => {
    this.setState({
      successalert: '',
      failalert: '',
      orders: [],
      modalInsert: false,
      modalEdit: false,
      id_order: '',
      user: '',
      product: '',
      quantity: '',
      warnings: {}
    });
    this.getOrders();
  }

  handleInput = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleSelect = (name) => (event) => {
    this.setState({ [name]: event })
  }

  setWarning = (name, message) => {
    var warnings = this.state.warnings;
    warnings[name] = message;
    this.setState({ warnings: warnings });
  }

  validOrder = () => {
    let valid = true;

    if (!this.state.user) {
      valid = false;
      this.setWarning('user', 'Required field user');
    }
    if (!this.state.product) {
      valid = false;
      this.setWarning('product', 'Required field product');
    }
    if (!this.state.quantity || this.state.quantity <= 0) {
      valid = false;
      this.setWarning('quantity', 'Required field quantity');
    }

    return valid;
  }

  onSubmit = () => {
    if (this.validOrder()) {
      axios.post('http://localhost:5000/order', {
        id_user: this.state.user.value,
        id_product: this.state.product.value,
        quantity: this.state.quantity
      })
        .then(res => {
          if (res.status === 200) {
            this.closeModal();
            this.setState({ successalert: 'New order created' });
          }
          else throw res;
        })
        .catch(err => {
          this.setState({ failalert: 'Something went wrong while order creation' });
        })
    }
  }

  onUpdate = () => {
    if (this.validOrder()) {
      axios.put('http://localhost:5000/order/' + this.state.id_order, {
        id_user: this.state.user.value,
        id_product: this.state.product.value,
        quantity: this.state.quantity
      })
        .then(res => {
          if (res.status === 200) {
            this.closeModal();
            this.setState({ successalert: 'Order has been updated' });
          }
          else throw res;
        })
        .catch(err => {
          this.setState({ failalert: 'Something went wrong while order updation' });
        })
    }
  }

  deleteOrder = (event) => {
    event.preventDefault();
    let value = event.currentTarget.value;
    fetch(`http://localhost:5000/order/${value}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(res => {
      if (res.status === 204) {
        this.setState({ successalert: 'Order deleted successfully', orders: [] });
        this.getOrders();
      }
      else this.setState({ failalert: 'Cannot delete oder' });
    });
  }

  editOrder = (event) => {
    event.preventDefault();
    let value = event.currentTarget.value;
    fetch(`http://localhost:5000/order/${value}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => parseResponse(res))
      .then((data) => this.setState({
        id_order: data._id,
        user: { key: data.id_user, value: data.id_user, label: data.user },
        product: { key: data.id_product, value: data.id_product, label: data.product },
        quantity: data.quantity,
        modalEdit: true
      }))
      .catch(err => {
        this.props.history.push('/err');
      });
  }

  render() {
    return (
      <CRow className="justify-content-center" >
        <CCol md={12} lg={12} xs={12}>
          <CAlert color='warning' closeButton>Get 20% discount on order contains 3 Pepsi cola</CAlert>
          {this.state.successalert && <CAlert color='success' closeButton>{this.state.successalert}</CAlert>}
          {this.state.failalert && <CAlert color='danger' closeButton>{this.state.failalert}</CAlert>}
          <CCard>
            <CCardHeader>
              <b>Orders</b>
              <CButtonToolbar className='float-right'>
                <CButtonGroup>
                  <CSelect name="creator" onClick={(e) => this.search(e.target.value)}>
                    <option value='0'>All</option>
                    <option value='1'>Last day</option>
                    <option value='7'>Last 7 day</option>
                  </CSelect>
                </CButtonGroup>&nbsp;
                <CButton color='success' size='sm' onClick={() => this.setState({ modalInsert: true })}>
                  New Order
              </CButton>
              </CButtonToolbar>
            </CCardHeader>
            <CCardBody>
              <CDataTable
                items={this.state.orders}
                fields={fields}
                outlined
                columnFilter
                itemsPerPage={10}
                hover border sorter
                pagination
                scopedSlots={{
                  'id':
                    (item, index) => {
                      return (
                        <td>{index + 1}</td>
                      )
                    },
                  'actions':
                    (item, index) => {
                      return (
                        <td>
                          <CButton className='text-warning' size='sm' value={item._id}
                            onClick={this.editOrder}>
                            Edit
                          </CButton>&nbsp;
                          <CButton className='text-danger' size='sm' value={item._id}
                            onClick={this.deleteOrder}>
                            Delete
                          </CButton>
                        </td>
                      )
                    }
                }}
              />
            </CCardBody>
          </CCard>

          {/* Insert modal */}
          <CModal
            show={this.state.modalInsert || this.state.modalEdit}
            color={this.state.modalInsert ? 'success' : 'warning'}
            onClose={this.closeModal}>
            <CModalHeader closeButton>
              {this.state.modalInsert && <b>Create order</b>}
              {this.state.modalEdit && <b>Update order</b>}
            </CModalHeader>
            <CForm>
              <CModalBody>
                <CFormGroup row>
                  <CCol>
                    <CLabel>User</CLabel>
                    <Select value={this.state.user} onChange={this.handleSelect('user')}
                      options={this.state.users} />
                    {this.state.warnings.user && <CAlert color='danger' >{this.state.warnings.user} </CAlert>}
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol>
                    <CLabel>Product</CLabel>
                    <Select value={this.state.product} onChange={this.handleSelect('product')}
                      options={this.state.products} />
                    {this.state.warnings.product && <CAlert color='danger' >{this.state.warnings.product} </CAlert>}
                  </CCol>
                </CFormGroup>
                <CFormGroup row>
                  <CCol>
                    <CLabel>Qunatity</CLabel>
                    <CInput type='number' value={this.state.quantity} name='quantity' onChange={this.handleInput}></CInput>
                    {this.state.warnings.quantity && <CAlert color='danger' >{this.state.warnings.quantity} </CAlert>}
                  </CCol>
                </CFormGroup>
              </CModalBody>
              <CModalFooter>
                {this.state.modalInsert && <CButton color='success' size='sm' onClick={this.onSubmit} > create </CButton>}
                {this.state.modalEdit && <CButton color='success' size='sm' onClick={this.onUpdate} > update </CButton>}
                {' '}
                <CButton color='danger' size='sm' onClick={this.closeModal} > cancel </CButton>
              </CModalFooter>
            </CForm>
          </CModal>

        </CCol>
      </CRow >
    )
  }
}

export default Orders;
