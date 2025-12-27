// Form Wizard Navigation for Create Group Modal

let currentStep = 1;
const totalSteps = 3;

function nextStep(step) {
    // Validate current step before proceeding
    if (currentStep === 1) {
        const fundName = document.getElementById('fundName').value.trim();
        if (!fundName) {
            showToast('Por favor ingresa un nombre para el grupo', 'warning');
            return;
        }
    }
    
    // Hide current step
    document.querySelector(`.form-step[data-step="${currentStep}"]`).style.display = 'none';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show next step
    currentStep = step;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).style.display = 'block';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
    
    // Mark previous steps as completed
    for (let i = 1; i < currentStep; i++) {
        document.querySelector(`.step[data-step="${i}"]`).classList.add('completed');
    }
}

function previousStep(step) {
    // Hide current step
    document.querySelector(`.form-step[data-step="${currentStep}"]`).style.display = 'none';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.remove('active');
    
    // Show previous step
    currentStep = step;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).style.display = 'block';
    document.querySelector(`.step[data-step="${currentStep}"]`).classList.add('active');
}

// Reset wizard when modal is closed
function resetFormWizard() {
    currentStep = 1;
    
    // Hide all steps except first
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.style.display = index === 0 ? 'block' : 'none';
    });
    
    // Reset step indicator
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index === 0) {
            step.classList.add('active');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}
