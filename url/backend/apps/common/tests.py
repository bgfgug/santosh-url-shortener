"""
Tests for the common app — Base62 encoding and key generation.
"""

from unittest.mock import patch

from django.test import TestCase

from apps.common.constants import BASE62_ALPHABET, SHORT_KEY_LENGTH
from apps.common.utils import base62_decode, base62_encode, generate_short_key, get_client_ip


class Base62Tests(TestCase):
    """Test Base62 encoding and decoding."""

    def test_encode_zero(self):
        self.assertEqual(base62_encode(0), "0")

    def test_encode_positive(self):
        self.assertEqual(base62_encode(61), "z")
        self.assertEqual(base62_encode(62), "10")

    def test_encode_large_number(self):
        result = base62_encode(999999)
        self.assertTrue(all(c in BASE62_ALPHABET for c in result))

    def test_decode_roundtrip(self):
        for num in [0, 1, 61, 62, 100, 123456, 999999999]:
            self.assertEqual(base62_decode(base62_encode(num)), num)

    def test_encode_negative_raises(self):
        with self.assertRaises(ValueError):
            base62_encode(-1)


class ShortKeyGenerationTests(TestCase):
    """Test collision-safe key generation."""

    def test_generates_key_of_correct_length(self):
        key = generate_short_key(exists_fn=lambda k: False)
        self.assertEqual(len(key), SHORT_KEY_LENGTH)

    def test_key_contains_valid_characters(self):
        key = generate_short_key(exists_fn=lambda k: False)
        self.assertTrue(all(c in BASE62_ALPHABET for c in key))

    def test_retries_on_collision(self):
        call_count = 0

        def exists_fn(key):
            nonlocal call_count
            call_count += 1
            # Collide on the first two attempts
            return call_count <= 2

        key = generate_short_key(exists_fn=exists_fn)
        self.assertEqual(len(key), SHORT_KEY_LENGTH)
        self.assertGreaterEqual(call_count, 3)

    def test_raises_after_max_retries(self):
        with self.assertRaises(RuntimeError):
            generate_short_key(exists_fn=lambda k: True, max_retries=3)


class GetClientIPTests(TestCase):
    """Test IP extraction utility."""

    def test_extracts_remote_addr(self):
        class FakeRequest:
            META = {"REMOTE_ADDR": "10.0.0.1"}

        self.assertEqual(get_client_ip(FakeRequest()), "10.0.0.1")

    def test_extracts_x_forwarded_for(self):
        class FakeRequest:
            META = {
                "HTTP_X_FORWARDED_FOR": "203.0.113.1, 70.41.3.18",
                "REMOTE_ADDR": "10.0.0.1",
            }

        self.assertEqual(get_client_ip(FakeRequest()), "203.0.113.1")
