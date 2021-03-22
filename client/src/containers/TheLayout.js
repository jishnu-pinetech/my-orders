import React from 'react'
import {
  TheContent,
} from './index'

const TheLayout = () => {

  return (
    <div className="c-app c-default-layout">
      <div className="c-wrapper">
        <div className="c-body">
          <TheContent/>
        </div>
      </div>
    </div>
  )
}

export default TheLayout
