import React from 'react'
import {
  CCol,
  CContainer,
  CRow
} from '@coreui/react'

const Page500 = () => {
  return (
    <div className="c-app c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="6">
            <span className="clearfix">
              <h1 className="float-left display-3 mr-4">500</h1>
              <h4 className="pt-3">Oops, something went wrong!</h4>
              <p className="text-muted float-left">The page you are looking for is temporarily unavailable.</p>
              <p className="text-muted float-left">go back to <a href='/'>orders</a>.</p>
            </span>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page500
