/* Modal class */
/* eslint-disable no-unused-vars */

class Modal {
  constructor(
    modalType = 'perm',
    modalTitle = 'Confirmation',
    modalText = 'You sure?',
    acceptText = 'Yes',
    cancelText = 'No',
    modalClass = null
  ) {
    this.modalDelay = 1500
    this.modalType = modalType
    this.modalTitle = modalTitle
    this.modalText = modalText
    this.modalClass = modalClass
    this.acceptText = acceptText
    this.cancelText = cancelText

    this.parent = document.body

    this.modal = undefined
    this.acceptButton = undefined
    this.cancelButton = undefined
    this.closeButton = undefined

    this._createModal(modalType)

    if (modalType == 'temp') {
      // close temp modals after delay
      let modal = this
      setTimeout(
        function (modal) {
          modal._destroyModal()
        }.bind(this, modal),
        this.modalDelay
      )
    }
  }

  question() {
    return new Promise((resolve, reject) => {
      if (!this.modal || !this.acceptButton || !this.cancelButton) {
        reject('There was a problem creating the modal window!')
        return
      }
      this.acceptButton.focus()

      this.acceptButton.addEventListener('click', () => {
        resolve(true)
        this._destroyModal()
      })

      this.cancelButton.addEventListener('click', () => {
        resolve(false)
        this._destroyModal()
      })
    })
  }

  _createModal(modalType) {
    // Background dialog
    this.modal = document.createElement('dialog')
    this.modal.classList.add('modal-dialog')

    // add proper CSS class
    switch (modalType) {
      case 'confirm':
      case 'confirm-debug':
        this.modal.classList.add('modal-confirm')
        break

      case 'temp':
        this.modal.classList.add('temp')
        break

      case 'temp-api':
        this.modal.classList.add('temp-api')
        break

      case 'end-state':
        this.modal.classList.add('end-state')
        break
    }

    // Message window
    const msgWindow = document.createElement('div')
    msgWindow.classList.add('modal-window')
    msgWindow.classList.add('animate__animated', 'animate__fadeInUp')

    if (this.modalClass) {
      msgWindow.classList.add(this.modalClass)
    }

    if (modalType == 'perm-debug' || modalType == 'confirm-debug') {
      msgWindow.classList.add('debug')
    }

    this.modal.appendChild(msgWindow)

    // if not a temporary modal, add a title and close button
    if (modalType != 'temp' && modalType != 'temp-api') {
      // Title
      const title = document.createElement('div')
      title.classList.add('modal-title')

      if (modalType == 'perm-debug' || modalType == 'confirm-debug') {
        title.classList.add('debug')
      }

      msgWindow.appendChild(title)

      // Title text
      const titleText = document.createElement('div')
      titleText.textContent = this.modalTitle
      title.appendChild(titleText)

      // Close
      if (modalType == 'perm' || modalType == 'perm-debug') {
        this.closeButton = document.createElement('button')
        this.closeButton.type = 'button'
        this.closeButton.innerHTML = '&times;'
        this.closeButton.classList.add('modal-close')
        this.closeButton.addEventListener('click', () => {
          this._destroyModal()
        })
        title.appendChild(this.closeButton)
      }
    }

    // Main text
    const text = document.createElement('div')
    text.classList.add('modal-text')
    text.innerHTML = this.modalText
    msgWindow.appendChild(text)

    // if a confirm modal, add buttons
    if (modalType == 'confirm' || modalType == 'confirm-debug') {
      // Accept and cancel button group
      const buttonGroup = document.createElement('div')
      buttonGroup.classList.add('modal-button-group')

      if (modalType == 'confirm-debug') {
        buttonGroup.classList.add('debug')
      }

      msgWindow.appendChild(buttonGroup)

      // Cancel button
      this.cancelButton = document.createElement('button')
      this.cancelButton.type = 'button'
      this.cancelButton.classList.add('modal-button')
      this.cancelButton.classList.add('modal-button-secondary')
      this.cancelButton.classList.add('modal-button-regular')
      this.cancelButton.textContent = this.cancelText
      buttonGroup.appendChild(this.cancelButton)

      // Accept button
      this.acceptButton = document.createElement('button')
      this.acceptButton.type = 'button'
      this.acceptButton.classList.add('modal-button')
      this.acceptButton.classList.add('modal-button-primary')
      this.acceptButton.classList.add('modal-button-regular')
      this.acceptButton.textContent = this.acceptText
      buttonGroup.appendChild(this.acceptButton)
    }

    // Let's rock
    this.parent.appendChild(this.modal)
  }

  _destroyModal() {
    if (this.modal) {
      const modals = document.getElementsByClassName('modal-dialog')
      const modalCount = modals.length
      const modal = modals[modalCount - 1]

      if (this.parent.contains(modal)) {
        if (!modal.classList.contains('modal-confirm')) {
          this.parent.removeChild(modal)
          delete this
        }
      }
    }
  }
}
