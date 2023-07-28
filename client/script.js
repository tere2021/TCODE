import bot from './assets/bot.svg';
import user from './assets/user.svg';


const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
      // Actualizar el contenido de texto del indicador de carga
      element.textContent += '.';

      // Si el indicador de carga ha alcanzado tres puntos suspensivos, restablécelo
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300);
}

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
      if (index < text.length) {
          element.innerHTML += text.charAt(index)
          index++
      } else {
          clearInterval(interval)
      }
  }, 20)
}

// Generar un ID único para cada mensaje div del bot
// necesario para el efecto de texto de escritura para esa respuesta específica
// sin un ID único, el efecto de escritura de texto funcionará en cada elemento
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // borrar el contenido del área de texto
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // Para enfocar, desplázate hacia abajo
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Mensaje específico div 
  const messageDiv = document.getElementById(uniqueId)

  // messageDiv.innerHTML = "..."
  loader(messageDiv)

  const response = await fetch('https://codex-im0y.onrender.com/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          prompt: data.get('prompt')
      })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = " "

  if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim() // Elimina cualquier espacio en blanco al final/'\n' 

      typeText(messageDiv, parsedData)
  } else {
      const err = await response.text()

      messageDiv.innerHTML = "Algo salió mal"
      alert(err)
  }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})