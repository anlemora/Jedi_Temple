import React from 'react'
import PropTypes from 'prop-types'

import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'

class TopFormDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...props.top }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange() {
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        onClick={this.props.onCancel}
      />,
      <FlatButton 
        label="Save"
        primary={true}
        onClick={this.props.onSave}
      />
    ]

    return (
      <Dialog
        title={this.props.top.name.length ? 'Edit Top' : 'New Top'}
        actions={actions}
        modal={true}
      >
        Hello
      </Dialog>
    )
  }
}

TopFormDialog.propTypes = {
  top: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}

export default TopFormDialog
