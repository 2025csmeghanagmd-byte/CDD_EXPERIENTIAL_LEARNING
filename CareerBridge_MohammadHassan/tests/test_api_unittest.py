"""
CareerBridge - Automated Unit & Integration Tests using Python standard library unittest.
Covers all 5 modules end-to-end.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app


class CareerBridgeApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config['TESTING'] = True
        cls.client = cls.app.test_client()

    def test_01_core_health(self):
        res = self.client.get('/api')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertIn('CareerBridge', data['message'])

    def test_02_auth_register_login_profile(self):
        email = f"unittest_{os.urandom(4).hex()}@careerbridge.com"
        # Register
        reg_res = self.client.post('/api/auth/register', json={
            "name": "Integration Student",
            "email": email,
            "password": "Password123!",
            "role": "student"
        })
        self.assertIn(reg_res.status_code, [200, 201])
        token = reg_res.get_json()['data']['token']

        # Login
        login_res = self.client.post('/api/auth/login', json={
            "email": email,
            "password": "Password123!"
        })
        self.assertEqual(login_res.status_code, 200)

        # Authenticated Profile
        headers = {"Authorization": f"Bearer {token}"}
        profile_res = self.client.get('/api/auth/profile', headers=headers)
        self.assertEqual(profile_res.status_code, 200)
        self.assertEqual(profile_res.get_json()['data']['user']['email'], email)

        # Dashboard stats
        stats_res = self.client.get('/api/auth/dashboard-stats', headers=headers)
        self.assertEqual(stats_res.status_code, 200)
        self.assertIn('totalInternships', stats_res.get_json()['data'])

    def test_03_forgot_and_reset_password(self):
        email = f"reset_{os.urandom(4).hex()}@careerbridge.com"
        self.client.post('/api/auth/register', json={
            "name": "Password Reset User",
            "email": email,
            "password": "OldPassword123",
            "role": "student"
        })

        # Forgot password
        f_res = self.client.post('/api/auth/forgot-password', json={"email": email})
        self.assertEqual(f_res.status_code, 200)
        reset_token = f_res.get_json()['data']['reset_token']
        self.assertIsNotNone(reset_token)

        # Reset password
        r_res = self.client.post('/api/auth/reset-password', json={
            "token": reset_token,
            "password": "BrandNewPassword789",
            "confirm_password": "BrandNewPassword789"
        })
        self.assertEqual(r_res.status_code, 200)

        # Login with new password
        l_res = self.client.post('/api/auth/login', json={
            "email": email,
            "password": "BrandNewPassword789"
        })
        self.assertEqual(l_res.status_code, 200)

    def test_04_internship_management(self):
        # List internships
        list_res = self.client.get('/api/internship/list')
        self.assertEqual(list_res.status_code, 200)
        internships = list_res.get_json()['data']['internships']
        self.assertGreater(len(internships), 0)
        first_id = internships[0]['id']

        # Details
        detail_res = self.client.get(f'/api/internship/{first_id}')
        self.assertEqual(detail_res.status_code, 200)

        # Login
        auth_res = self.client.post('/api/auth/login', json={
            "email": "student@careerbridge.com",
            "password": "student123"
        })
        token = auth_res.get_json()['data']['token']
        headers = {"Authorization": f"Bearer {token}"}

        # Bookmark toggle
        bm_res = self.client.post('/api/internship/bookmark', json={"internship_id": first_id}, headers=headers)
        self.assertEqual(bm_res.status_code, 200)

        # Get bookmarks
        my_bm = self.client.get('/api/internship/my-bookmarks', headers=headers)
        self.assertEqual(my_bm.status_code, 200)

        # Get applications
        my_apps = self.client.get('/api/internship/my-applications', headers=headers)
        self.assertEqual(my_apps.status_code, 200)

    def test_05_placement_preparation(self):
        # Categories
        cat_res = self.client.get('/api/placement/categories')
        self.assertEqual(cat_res.status_code, 200)

        # Mock tests
        test_res = self.client.get('/api/placement/mock-tests')
        self.assertEqual(test_res.status_code, 200)
        tests = test_res.get_json()['data']['mock_tests']
        self.assertGreater(len(tests), 0)
        test_id = tests[0]['id']

        # Detail for test
        det_res = self.client.get(f'/api/placement/mock-tests/{test_id}')
        self.assertEqual(det_res.status_code, 200)

        # Submit test
        auth_res = self.client.post('/api/auth/login', json={
            "email": "student@careerbridge.com",
            "password": "student123"
        })
        token = auth_res.get_json()['data']['token']
        headers = {"Authorization": f"Bearer {token}"}

        sub_res = self.client.post(
            f'/api/placement/mock-tests/{test_id}/submit',
            json={"answers": {"1": "B", "2": "B"}, "time_taken": 90},
            headers=headers
        )
        self.assertEqual(sub_res.status_code, 200)
        self.assertIn('score', sub_res.get_json()['data'])

    def test_06_skill_gap_analyzer(self):
        # Roles
        roles_res = self.client.get('/api/skill-gap/roles')
        self.assertEqual(roles_res.status_code, 200)
        roles = roles_res.get_json()['data']['job_roles']
        self.assertGreater(len(roles), 0)

        # User skills
        auth_res = self.client.post('/api/auth/login', json={
            "email": "student@careerbridge.com",
            "password": "student123"
        })
        token = auth_res.get_json()['data']['token']
        headers = {"Authorization": f"Bearer {token}"}

        add_res = self.client.post(
            '/api/skill-gap/user-skills',
            json={"skill_name": "Python", "proficiency": "advanced"},
            headers=headers
        )
        self.assertEqual(add_res.status_code, 200)

        analyze_res = self.client.post(
            '/api/skill-gap/analyze',
            json={"job_role_id": roles[0]['id']},
            headers=headers
        )
        self.assertEqual(analyze_res.status_code, 200)
        self.assertIn('readiness_score', analyze_res.get_json()['data'])

    def test_07_skill_exchange_marketplace(self):
        list_res = self.client.get('/api/skill-exchange/listings')
        self.assertEqual(list_res.status_code, 200)

        auth_res = self.client.post('/api/auth/login', json={
            "email": "student@careerbridge.com",
            "password": "student123"
        })
        token = auth_res.get_json()['data']['token']
        headers = {"Authorization": f"Bearer {token}"}

        create_res = self.client.post(
            '/api/skill-exchange/listings',
            json={
                "skill_name": "Thermodynamics & Heat Transfer",
                "description": "Tutoring peer mechanical engineering students on Carnot and Rankine cycles",
                "type": "offer",
                "is_paid": False,
                "price": 0
            },
            headers=headers
        )
        self.assertEqual(create_res.status_code, 200)

        req_res = self.client.get('/api/skill-exchange/my-requests', headers=headers)
        self.assertEqual(req_res.status_code, 200)


if __name__ == '__main__':
    unittest.main()

