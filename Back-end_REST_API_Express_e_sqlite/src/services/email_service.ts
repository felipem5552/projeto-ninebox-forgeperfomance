import nodemailer from 'nodemailer'

// Variável para guardar a configuração
let transporter: nodemailer.Transporter

// Função interna que configura o Ethereal 
async function configurarTransporter() {
  if (transporter) return

  // Cria uma conta de teste só pra ver se está funcionando
  const testAccount = await nodemailer.createTestAccount()

  // Configuração do transporter do nodemailer
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });
  
  console.log('📧 Serviço de E-mail (Modo Teste) Inicializado!')
}

export async function enviarConviteAvaliacao(emailDestino: string, nomeFuncionario: string) {
  
  // Garantindo que a config está pronta
  await configurarTransporter()

  // Link que o funcionário supostamente clicaria clicaria
  const linkAvaliacao = `http://localhost:3000/avaliar` 

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Olá, ${nomeFuncionario}!</h2>
      <p>O período de avaliação de desempenho começou.</p>
      <p>Por favor, clique no botão abaixo para realizar sua avaliação:</p>
      
      <a href="${linkAvaliacao}" style="
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      ">
        ACESSAR AVALIAÇÃO
      </a>
      
      <p style="font-size: 12px; color: #888; margin-top: 20px;">
        Este é um e-mail automático do Sistema Nine-Box.
      </p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: '"RH Nine-Box" <rh@sistema.com>', 
      to: emailDestino,
      subject: 'Convite para Avaliação de Desempenho',
      html: htmlContent,
      text: `Olá ${nomeFuncionario}, acesse ${linkAvaliacao} para avaliar.`
    });

    console.log(`✅ E-mail simulado para: ${nomeFuncionario}`)
    console.log(`🔗 VISUALIZAR E-MAIL: ${nodemailer.getTestMessageUrl(info)}`)
    
    return true
  } catch (erro) {
    console.error(`❌ Falha ao enviar para ${nomeFuncionario}:`, erro)
    return false
  }
}
