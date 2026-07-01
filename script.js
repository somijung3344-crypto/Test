document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const signupForm = document.getElementById('signupForm');
    
    // Inputs
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('passwordConfirm');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const termsCheckbox = document.getElementById('terms');
    
    // Input Groups (for applying success/error classes)
    const userIdGroup = document.getElementById('userIdGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const passwordConfirmGroup = document.getElementById('passwordConfirmGroup');
    const emailGroup = document.getElementById('emailGroup');
    const phoneGroup = document.getElementById('phoneGroup');
    
    // Password Strength & Toggle
    const pwdStrengthBar = document.querySelector('.pwd-strength-bar');
    const strengthFill = document.getElementById('strengthFill');
    const pwdToggleBtn = document.querySelector('.pwd-toggle-btn');
    const eyeOffIcon = document.querySelector('.eye-off');
    const eyeOnIcon = document.querySelector('.eye-on');
    
    // Modal
    const successModal = document.getElementById('successModal');
    const modalUserId = document.getElementById('modalUserId');
    const modalEmail = document.getElementById('modalEmail');
    const modalPhone = document.getElementById('modalPhone');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Track if inputs have been "touched" (focused out at least once)
    const touchedFields = {
        userId: false,
        password: false,
        passwordConfirm: false,
        email: false,
        phone: false
    };

    // ==========================================
    // 1. Password Visibility Toggle
    // ==========================================
    pwdToggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        if (isPassword) {
            passwordInput.setAttribute('type', 'text');
            passwordConfirmInput.setAttribute('type', 'text');
            eyeOffIcon.classList.add('hidden');
            eyeOnIcon.classList.remove('hidden');
        } else {
            passwordInput.setAttribute('type', 'password');
            passwordConfirmInput.setAttribute('type', 'password');
            eyeOnIcon.classList.add('hidden');
            eyeOffIcon.classList.remove('hidden');
        }
    });

    // ==========================================
    // 2. Validation Patterns (Regex)
    // ==========================================
    // ID: 영문 소문자 및 숫자 조합 5~20자
    const userIdRegex = /^[a-z0-9]{5,20}$/;
    
    // Email: 표준 이메일 형식
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Phone: 010-XXXX-XXXX 형식
    const phoneRegex = /^010-\d{3,4}-\d{4}$/;

    // ==========================================
    // 3. Password Strength Checker
    // ==========================================
    function checkPasswordStrength(password) {
        let score = 0;
        
        if (!password) {
            pwdStrengthBar.style.display = 'none';
            return score;
        }
        
        pwdStrengthBar.style.display = 'block';

        // Criteria checks
        if (password.length >= 8 && password.length <= 16) score++;
        if (/[a-zA-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

        // Update UI based on score
        if (password.length < 8) {
            // Under 8 characters is always weak
            strengthFill.style.width = '25%';
            strengthFill.style.backgroundColor = '#EB5757'; // Red
            return 1;
        }

        switch (score) {
            case 2:
                strengthFill.style.width = '50%';
                strengthFill.style.backgroundColor = '#F29824'; // Orange
                break;
            case 3:
                strengthFill.style.width = '75%';
                strengthFill.style.backgroundColor = '#F2C94C'; // Yellow
                break;
            case 4:
                strengthFill.style.width = '100%';
                strengthFill.style.backgroundColor = '#27AE60'; // Green
                break;
            default:
                strengthFill.style.width = '25%';
                strengthFill.style.backgroundColor = '#EB5757'; // Red
                break;
        }

        return score;
    }

    // ==========================================
    // 4. Input Formatter (Phone Auto-hyphen)
    // ==========================================
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        let formatted = '';
        if (value.length < 4) {
            formatted = value;
        } else if (value.length < 7) {
            formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length < 11) {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
        } else {
            formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        }

        e.target.value = formatted;

        // If touched, validate instantly on formatting change
        if (touchedFields.phone) {
            validatePhone();
        }
    });

    // ==========================================
    // 5. Individual Field Validation Functions
    // ==========================================
    function validateUserId() {
        const val = userIdInput.value.trim();
        const isValid = userIdRegex.test(val);
        
        if (isValid) {
            setSuccess(userIdGroup);
            return true;
        } else {
            setError(userIdGroup);
            return false;
        }
    }

    function validatePassword() {
        const val = passwordInput.value;
        const strength = checkPasswordStrength(val);
        // We require length 8-16 and a combination of letters, numbers, and special characters (strength >= 4)
        const isValid = val.length >= 8 && val.length <= 16 && /[a-zA-Z]/.test(val) && /\d/.test(val) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val);
        
        if (isValid) {
            setSuccess(passwordGroup);
            return true;
        } else {
            setError(passwordGroup);
            return false;
        }
    }

    function validatePasswordConfirm() {
        const pass = passwordInput.value;
        const confirmPass = passwordConfirmInput.value;
        const isMatch = pass === confirmPass && confirmPass !== '';
        
        if (isMatch && passwordConfirmGroup.classList.contains('error') === false) {
            // Also ensure password itself is valid
            if (passwordGroup.classList.contains('success')) {
                setSuccess(passwordConfirmGroup);
                return true;
            }
        }
        
        if (isMatch) {
            setSuccess(passwordConfirmGroup);
            return true;
        } else {
            setError(passwordConfirmGroup);
            return false;
        }
    }

    function validateEmail() {
        const val = emailInput.value.trim();
        const isValid = emailRegex.test(val);
        
        if (isValid) {
            setSuccess(emailGroup);
            return true;
        } else {
            setError(emailGroup);
            return false;
        }
    }

    function validatePhone() {
        const val = phoneInput.value.trim();
        const isValid = phoneRegex.test(val);
        
        if (isValid) {
            setSuccess(phoneGroup);
            return true;
        } else {
            setError(phoneGroup);
            return false;
        }
    }

    // Helper functions to set UI state
    function setError(elementGroup) {
        elementGroup.classList.remove('success');
        elementGroup.classList.add('error');
    }

    function setSuccess(elementGroup) {
        elementGroup.classList.remove('error');
        elementGroup.classList.add('success');
    }

    // ==========================================
    // 6. Focus & Blur Event Listeners
    // ==========================================
    
    // ID Validation
    userIdInput.addEventListener('blur', () => {
        touchedFields.userId = true;
        validateUserId();
    });
    userIdInput.addEventListener('input', () => {
        if (touchedFields.userId) validateUserId();
    });

    // Password Validation
    passwordInput.addEventListener('input', () => {
        checkPasswordStrength(passwordInput.value);
        if (touchedFields.password) {
            validatePassword();
        }
        // Validate password confirmation simultaneously if it was already touched
        if (touchedFields.passwordConfirm) {
            validatePasswordConfirm();
        }
    });
    passwordInput.addEventListener('blur', () => {
        touchedFields.password = true;
        validatePassword();
    });

    // Password Confirm Validation
    passwordConfirmInput.addEventListener('blur', () => {
        touchedFields.passwordConfirm = true;
        validatePasswordConfirm();
    });
    passwordConfirmInput.addEventListener('input', () => {
        if (touchedFields.passwordConfirm) validatePasswordConfirm();
    });

    // Email Validation
    emailInput.addEventListener('blur', () => {
        touchedFields.email = true;
        validateEmail();
    });
    emailInput.addEventListener('input', () => {
        if (touchedFields.email) validateEmail();
    });

    // Phone Validation
    phoneInput.addEventListener('blur', () => {
        touchedFields.phone = true;
        validatePhone();
    });

    // ==========================================
    // 7. Form Submission
    // ==========================================
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Mark all fields as touched to trigger error states
        Object.keys(touchedFields).forEach(key => touchedFields[key] = true);

        // Run validation on all fields
        const isUserIdValid = validateUserId();
        const isPasswordValid = validatePassword();
        const isPasswordConfirmValid = validatePasswordConfirm();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isTermsAccepted = termsCheckbox.checked;

        // Collect validity status
        const isFormValid = isUserIdValid && isPasswordValid && isPasswordConfirmValid && isEmailValid && isPhoneValid;

        if (!isFormValid) {
            // Scroll to the first error group and focus
            const firstErrorGroup = document.querySelector('.input-group.error');
            if (firstErrorGroup) {
                const input = firstErrorGroup.querySelector('input');
                if (input) {
                    input.focus();
                    firstErrorGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        if (!isTermsAccepted) {
            alert('개인정보 수집 및 이용 동의에 체크해주세요.');
            termsCheckbox.focus();
            return;
        }

        // ==========================================
        // 8. Successful Registration Flow (Simulated DB)
        // ==========================================
        const userData = {
            userId: userIdInput.value.trim(),
            password: passwordInput.value, // Hashed in production
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim()
        };

        // 8a. Retrieve existing users from Local Storage or initialize empty array
        const registeredUsers = JSON.parse(localStorage.getItem('yjuUsers') || '[]');
        
        // 8b. Simulate checking DB for UNIQUE constraint violations (user_id and email)
        const isIdDuplicate = registeredUsers.some(u => u.userId === userData.userId);
        const isEmailDuplicate = registeredUsers.some(u => u.email === userData.email);

        if (isIdDuplicate) {
            setError(userIdGroup);
            document.getElementById('userIdMsg').textContent = '이미 사용 중인 아이디입니다.';
            document.getElementById('userIdMsg').style.display = 'flex';
            userIdInput.focus();
            return;
        }

        if (isEmailDuplicate) {
            setError(emailGroup);
            document.getElementById('emailMsg').textContent = '이미 등록된 이메일 주소입니다.';
            document.getElementById('emailMsg').style.display = 'flex';
            emailInput.focus();
            return;
        }

        // 8c. Calculate new primary key auto-increment number
        const nextNum = registeredUsers.length > 0 ? Math.max(...registeredUsers.map(u => u.num || 0)) + 1 : 1;
        userData.num = nextNum;
        userData.created_at = new Date().toISOString();

        // 8d. Push to mock database (Local Storage)
        registeredUsers.push(userData);
        localStorage.setItem('yjuUsers', JSON.stringify(registeredUsers));
        sessionStorage.setItem('currentUser', JSON.stringify(userData));

        // 8e. Display success logs mimicking database actions in developers console
        console.group('%c🔑 Yeungjin University Portal DB Simulation', 'color: #0B3364; font-size: 14px; font-weight: bold;');
        console.log('%c[SQL Query Issued]%c INSERT INTO users (user_id, password, email, phone_number) VALUES (?, ?, ?, ?);', 'color: #8E44AD; font-weight: bold;', 'color: #2C3E50;');
        console.log(`%c[SQL Params]%c num: ${userData.num}, user_id: "${userData.userId}", password: "[Hashed:BCrypt]", email: "${userData.email}", phone_number: "${userData.phone}"`, 'color: #8E44AD; font-weight: bold;', 'color: #2C3E50;');
        console.log('%c[Database Response]%c 1 row inserted successfully. (Query took 4ms)', 'color: #27AE60; font-weight: bold;', 'color: #2D3748;');
        console.log('%c[Local Storage Status]%c Current DB Row Count:', 'color: #3498DB; font-weight: bold;', 'color: #2C3E50;', registeredUsers.length);
        console.table(registeredUsers);
        console.groupEnd();

        // 8f. Populate Modal content and display it
        modalUserId.textContent = userData.userId;
        modalEmail.textContent = userData.email;
        modalPhone.textContent = userData.phone;
        
        successModal.classList.add('active');
    });

    // ==========================================
    // 9. Close Modal & Redirect to Welcome Page
    // ==========================================
    modalCloseBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        window.location.href = 'welcome.html';
    });
});
